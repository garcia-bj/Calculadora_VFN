# Este archivo es el "cerebro" del servidor de la calculadora de Valor Futuro Neto (VFN)
# Aquí se define cómo se comporta la aplicación web y cómo se hacen los cálculos

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Creamos la aplicación principal de FastAPI (es como el motor del servidor)
app = FastAPI()

# Le decimos al servidor que los archivos estáticos (CSS, JS, imágenes) están en la carpeta 'static'
app.mount("/static", StaticFiles(directory="static"), name="static")

# Le decimos dónde buscar las plantillas HTML (las páginas que verá el usuario)
templates = Jinja2Templates(directory="templates")

# Definimos la ruta principal (la página inicial)
@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    # Cuando alguien entra a la página, le mostramos el archivo index.html
    return templates.TemplateResponse("index.html", {"request": request})

# Definimos la ruta para la página informativa del VFN
@app.get("/info", response_class=HTMLResponse)
def vfn_info(request: Request):
    # Cuando alguien entra a /info, le mostramos la explicación del VFN
    return templates.TemplateResponse("vfn_info.html", {"request": request})

# Definimos la ruta para calcular el Valor Futuro Neto (VFN)
@app.post("/api/vfn")
async def calcular_vfn(data: dict):
    # Espera recibir un diccionario con las siguientes claves:
    # "flujo": el flujo de caja ingresado por el usuario (ejemplo: 1000)
    # "tasa": la tasa de descuento anual en porcentaje (ejemplo: 10 para 10%)
    # "periodos": el número de periodos (ejemplo: 5 años)
    flujo = float(data.get("flujo", 0))  # Convertimos el flujo a número decimal
    tasa = float(data.get("tasa", 0)) / 100  # Convertimos la tasa a decimal (por ejemplo, 10% -> 0.10)
    periodos = int(data.get("periodos", 0))  # Convertimos los periodos a número entero

    # Calculamos el Valor Futuro Neto usando la fórmula: VFN = flujo * (1 + tasa) ^ periodos
    vfn = flujo * ((1 + tasa) ** periodos)

    # Devolvemos el resultado al usuario en formato JSON (como un "mensaje de texto" que entiende la web)
    return JSONResponse({"vfn": round(vfn, 2)})
