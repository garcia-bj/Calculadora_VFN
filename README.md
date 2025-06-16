# Calculadora Avanzada de Evaluación de Proyectos de Inversión (VAN y VFN)

Este proyecto es una aplicación web interactiva diseñada para realizar análisis financieros completos de proyectos de inversión. Calcula tanto el **Valor Actual Neto (VAN)** como el **Valor Futuro Neto (VFN)**, ofreciendo una recomendación clara sobre la viabilidad del proyecto. La interfaz es moderna, intuitiva y visualmente atractiva, incluyendo un gráfico dinámico de los flujos de caja.

## Características Principales

- **Doble Métrica de Evaluación:** Calcula el **VAN** (para decidir si aceptar o rechazar un proyecto) y el **VFN** (para conocer el valor del proyecto al final de su vida útil).
- **Manejo de Múltiples Tipos de Flujo de Caja:**
  - **Flujos Constantes (Anualidades):** Ingresos o egresos fijos en cada período.
  - **Gradiente Aritmético:** Flujos que aumentan o disminuyen en una cantidad constante.
  - **Flujos Irregulares:** Permite ingresar un valor específico para cada año del proyecto.
- **Cálculo Preciso de Tasas de Interés:** Convierte una **Tasa Nominal Anual** a la **Tasa Efectiva Anual** correspondiente, basándose en diferentes períodos de capitalización (anual, semestral, trimestral, mensual).
- **Interfaz Interactiva y Dinámica:** El formulario se adapta en tiempo real según el tipo de flujo de caja seleccionado.
- **Visualización de Datos:** Incluye un **gráfico de barras dinámico (usando Chart.js)** que muestra los flujos de caja netos de cada período, facilitando la comprensión del proyecto.
- **Recomendación Automatizada:** Proporciona una recomendación clara (`✅ Proyecto Recomendado` o `❌ Proyecto No Recomendado`) basada en si el VAN es positivo.
- **API RESTful:** Expone un endpoint robusto para realizar los cálculos desde cualquier cliente externo.

## Tecnologías Utilizadas

- **Backend:** Python, FastAPI
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Visualización:** Chart.js
- **Plantillas:** Jinja2

## Instalación y Puesta en Marcha

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

1.  **Clona el repositorio:**
    ```bash
    git clone <URL-DEL-REPOSITORIO>
    cd <NOMBRE-DEL-DIRECTORIO>
    ```

2.  **Crea y activa un entorno virtual:**
    ```bash
    # En Windows
    python -m venv venv
    venv\Scripts\activate

    # En macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Instala las dependencias:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Inicia el servidor:**
    ```bash
    uvicorn main:app --reload
    ```

5.  **Abre tu navegador:**
    Visita [http://127.0.0.1:8000](http://127.0.0.1:8000) para usar la aplicación.

## API

La aplicación expone un endpoint de API para realizar todos los cálculos financieros.

- **Endpoint:** `POST /api/vfn`
- **Descripción:** Calcula el VAN y VFN de un proyecto de inversión.
- **Cuerpo de la Solicitud (JSON):**

  El cuerpo de la solicitud debe contener los datos fundamentales del proyecto y un objeto `flujos` que varía según el `tipoFlujo`.

  **Estructura Base:**
  ```json
  {
    "inversion": 10000,
    "vidaUtil": 5,
    "salvamento": 1500,
    "tasaNominal": 12,
    "periodoCap": "semestral",
    "tipoFlujo": "constante", // Puede ser "constante", "gradienteAritmetico" o "irregular"
    "flujos": { ... } // Objeto que depende de tipoFlujo
  }
  ```

  **Ejemplos del Objeto `flujos`:**

  1.  **Para `tipoFlujo: "constante"`:**
      ```json
      "flujos": {
        "constante": 2500
      }
      ```

  2.  **Para `tipoFlujo: "gradienteAritmetico"`:**
      ```json
      "flujos": {
        "inicial": 2000,
        "gradiente": 500
      }
      ```

  3.  **Para `tipoFlujo: "irregular"`:**
      ```json
      "flujos": {
        "irregulares": [2000, 2200, 2500, 2300, 2800]
      }
      ```

- **Respuesta Exitosa (JSON):**
  ```json
  {
    "van": 1353.47,
    "vfn": 2385.5
  }
  ```

## Estructura del Proyecto

```
. 
├── main.py # Lógica del backend (FastAPI), cálculos financieros y API.
├── requirements.txt # Dependencias de Python.
├── static/
│   ├── app.js # Lógica del frontend (interacción del DOM, Chart.js, llamadas a la API).
│   └── styles.css # Estilos para la interfaz de usuario.
├── templates/
│   ├── index.html # Estructura principal de la calculadora.
│   └── vfn_info.html # Página informativa.
└── README.md # Este archivo.
```
