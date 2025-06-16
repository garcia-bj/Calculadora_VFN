# ===================================================================================
#  Archivo: main.py
#  Propósito: "Cerebro" del servidor. Realiza todos los cálculos financieros.
#  Versión Definitiva: 8.0 (Fórmulas Numéricamente Estables y Lógica Verificada)
# ===================================================================================

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import List, Optional
import math
from decimal import Decimal, getcontext

# Configura la precisión decimal para cálculos financieros exactos
getcontext().prec = 15

# --- Modelos de Datos ---
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

# --- Inicialización del Servidor ---
app = FastAPI(title="Calculadora Financiera API")
app.mount("/static", StaticFiles(directory="Calculadora_VFN/static"), name="static")
templates = Jinja2Templates(directory="Calculadora_VFN/templates")

# --- Rutas de las Páginas HTML ---
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/info", response_class=HTMLResponse)
def vfn_info(request: Request):
    return templates.TemplateResponse("vfn_info.html", {"request": request})

# --- Funciones de Cálculo Financiero ---

def calcular_tasa_efectiva_anual(tasa_nominal_porc, periodo_cap):
    """Calcula la tasa efectiva anual a partir de una tasa nominal."""
    tasa_nominal = Decimal(tasa_nominal_porc) / Decimal(100)
    m_map = {"anual": 1, "semestral": 2, "trimestral": 4, "mensual": 12}
    m = Decimal(m_map.get(periodo_cap, 1))
    return (Decimal(1) + tasa_nominal / m) ** m - Decimal(1)

def generar_flujos_operativos(datos: VFNData) -> List[Decimal]:
    """Genera una lista de los flujos de caja operativos de cada año."""
    n = datos.vidaUtil
    flujos_operativos = []

    if datos.tipoFlujo == "constante":
        A = Decimal(datos.flujos.constante or 0)
        flujos_operativos = [A] * n
    elif datos.tipoFlujo == "gradienteAritmetico":
        A1 = Decimal(datos.flujos.inicial or 0)
        G = Decimal(datos.flujos.gradiente or 0)
        # La forma correcta: el gradiente G empieza a aplicarse desde el segundo año.
        flujos_operativos = [A1 + Decimal(t) * G for t in range(n)]
    elif datos.tipoFlujo == "irregular":
        flujos_operativos = [Decimal(f or 0) for f in (datos.flujos.irregulares or [])]
        flujos_operativos.extend([Decimal(0)] * (n - len(flujos_operativos)))

    return flujos_operativos

# --- API Endpoint Principal ---
@app.post("/api/vfn")
async def endpoint_calcular_vfn(data: VFNData):
    try:
        tasa_efectiva = calcular_tasa_efectiva_anual(data.tasaNominal, data.periodoCap)
        
        # 1. Generar la lista de flujos de caja operativos.
        flujos_operativos = generar_flujos_operativos(data)
        
        # 2. Construir la lista completa de flujos netos, incluyendo inversión y salvamento.
        flujos_netos_totales = [Decimal(-data.inversion)]  # Año 0: Inversión
        flujos_netos_totales.extend(flujos_operativos)   # Años 1 a n: Flujos operativos
        
        if data.vidaUtil > 0 and data.salvamento != 0:
            flujos_netos_totales[data.vidaUtil] += Decimal(data.salvamento) # Sumar salvamento al flujo del último año

        # 3. Calcular VAN y VFN usando los flujos netos totales.
        n = data.vidaUtil
        van = sum(flujo / ((Decimal(1) + tasa_efectiva) ** t) for t, flujo in enumerate(flujos_netos_totales))
        vfn = sum(flujo * ((Decimal(1) + tasa_efectiva) ** (n - t)) for t, flujo in enumerate(flujos_netos_totales))

        return JSONResponse({
            "van": float(round(van, 2)),
            "vfn": float(round(vfn, 2)),
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error en el servidor: {e}")

