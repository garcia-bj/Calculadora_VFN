# ===================================================================================
#  Archivo: main.py
#  Propósito: "Cerebro" del servidor. Realiza todos los cálculos financieros.
#  Versión Mejorada: 2.1 (Más Robusta)
# ===================================================================================

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

# --- Modelos de Datos con Pydantic ---
class Flujos(BaseModel):
    constante: Optional[float] = None
    inicial: Optional[float] = None
    gradiente: Optional[float] = None
    irregulares: Optional[List[Optional[float]]] = None

class VFNData(BaseModel):
    inversion: float
    vidaUtil: int
    salvamento: float
    tasaNominal: float
    periodoCap: str
    tipoFlujo: str
    flujos: Flujos

# --- Inicialización de la Aplicación ---
app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# --- Rutas de las Páginas HTML ---
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/info", response_class=HTMLResponse)
def vfn_info(request: Request):
    return templates.TemplateResponse("vfn_info.html", {"request": request})

# --- Funciones de Cálculo Financiero ---

def calcular_tasa_efectiva_anual(tasa_nominal_porc, periodo_cap):
    """Calcula la tasa efectiva anual a partir de una tasa nominal y su capitalización."""
    tasa_nominal = tasa_nominal_porc / 100.0
    m_map = {"anual": 1, "semestral": 2, "trimestral": 4, "mensual": 12}
    m = m_map.get(periodo_cap, 1)
    tasa_efectiva = (1 + tasa_nominal / m) ** m - 1
    return tasa_efectiva

def calcular_van(datos: VFNData, i: float):
    """Calcula el Valor Actual Neto (VAN) del proyecto."""
    if i == -1:
        # Manejo especial para TIR donde i puede ser -100%
        # Aquí se debería implementar una lógica específica si fuera necesario,
        # pero para VAN es un caso extremo que indica un error o una situación no viable.
        return -float('inf')

    van = -datos.inversion
    n = datos.vidaUtil
    
    if datos.salvamento > 0:
        van += datos.salvamento / ((1 + i) ** n)

    tipo_flujo = datos.tipoFlujo
    flujos = datos.flujos

    # La lógica de cálculo ahora es más segura, usando 0 si el valor no viene.
    if tipo_flujo == "constante":
        A = flujos.constante or 0
        if i > 0:
            termino_pa = (((1 + i) ** n) - 1) / (i * ((1 + i) ** n))
            van += A * termino_pa
        else: # Si la tasa es 0, el valor presente es simplemente A * n
            van += A * n

    elif tipo_flujo == "gradienteAritmetico":
        A1 = flujos.inicial or 0
        G = flujos.gradiente or 0
        if i > 0:
            termino_pa = (((1 + i) ** n) - 1) / (i * ((1 + i) ** n))
            van += A1 * termino_pa
            
            termino_pg = ((((1 + i) ** n) - (i * n) - 1)) / ((i ** 2) * ((1 + i) ** n))
            van += G * termino_pg
        else: # Caso especial si tasa es 0
            van += A1 * n
            van += (G * n * (n - 1)) / 2

    elif tipo_flujo == "irregular":
        if flujos.irregulares:
            for t, flujo_val in enumerate(flujos.irregulares):
                flujo_t = flujo_val or 0
                van += flujo_t / ((1 + i) ** (t + 1))
            
    return van

# --- API Endpoint para el Cálculo Principal ---

@app.post("/api/vfn")
async def endpoint_calcular_vfn(data: VFNData):
    """
    Recibe los datos del proyecto, calcula la tasa efectiva, el VAN y el VFN,
    y devuelve los resultados.
    """
    try:
        tasa_efectiva = calcular_tasa_efectiva_anual(data.tasaNominal, data.periodoCap)
        van = calcular_van(data, tasa_efectiva)
        
        # El VFN solo se puede calcular si la tasa no es -100%
        vfn = van * ((1 + tasa_efectiva) ** data.vidaUtil) if tasa_efectiva > -1 else -float('inf')

        return JSONResponse({"van": van, "vfn": vfn})
    except Exception as e:
        # Devuelve un error claro si algo sale mal en el servidor.
        raise HTTPException(status_code=400, detail=f"Error en el servidor: {e}")