# Calculadora de Valor Futuro Neto (VFN)

Este proyecto es una aplicación web simple para calcular el Valor Futuro Neto (VFN) de un flujo de caja. La aplicación está construida con Python y el framework FastAPI.

## Descripción

La calculadora permite a los usuarios ingresar un flujo de caja, una tasa de descuento anual y un número de períodos para calcular el VFN. La interfaz es sencilla e intuitiva, y también incluye una página informativa que explica el concepto del VFN.

## Características

*   Calcula el Valor Futuro Neto (VFN).
*   Interfaz web amigable.
*   Página informativa sobre el VFN.
*   API REST para el cálculo del VFN.

## Tecnologías Utilizadas

*   **Backend:** Python, FastAPI
*   **Frontend:** HTML, CSS, JavaScript (utilizando plantillas Jinja2)

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
    venv\\Scripts\\activate

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
    Visita [http://127.0.0.1:8000](http://127.0.0.1:8000) para ver la aplicación en funcionamiento.

## Uso

1.  Abre la aplicación en tu navegador.
2.  Ingresa el flujo de caja, la tasa de interés anual (%) y el número de períodos en los campos correspondientes.
3.  Haz clic en el botón "Calcular" para ver el resultado del VFN.
4.  Puedes visitar la página de "Información" para entender mejor cómo se calcula el VFN.

## API

La aplicación expone un endpoint de API para realizar el cálculo del VFN.

*   **Endpoint:** `POST /api/vfn`
*   **Descripción:** Calcula el Valor Futuro Neto.
*   **Cuerpo de la solicitud (JSON):**
    ```json
    {
      "flujo": 1000,
      "tasa": 10,
      "periodos": 5
    }
    ```
*   **Respuesta (JSON):**
    ```json
    {
      "vfn": 1610.51
    }
    ```
