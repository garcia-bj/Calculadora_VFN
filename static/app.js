// ===================================================================================
//  Archivo: app.js
//  Propósito: Controla toda la interacción y lógica del frontend de la calculadora.
//  Versión Mejorada: 2.3 (CON DEPURACIÓN)
// ===================================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    console.log("DOM Cargado. Inicializando script...");

    // --- Selección de Elementos del DOM ---
    const form = document.getElementById('formulario');
    const resultadoDiv = document.getElementById('resultado');
    const tipoFlujoSelect = document.getElementById('tipoFlujo');
    const flujosDinamicosContainer = document.getElementById('flujosDinamicosContainer');
    const vidaUtilInput = document.getElementById('vidaUtil');
    const btnBorrar = document.getElementById('borrar');

    function getNumericValue(elementId, defaultValue = 0) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Error Crítico: No se encontró el elemento con id: ${elementId}`);
            return defaultValue;
        }
        const value = element.value;
        const parsedValue = parseFloat(value);
        return isNaN(parsedValue) ? defaultValue : parsedValue;
    }

    tipoFlujoSelect.addEventListener('change', actualizarCamposDeFlujo);
    vidaUtilInput.addEventListener('input', actualizarCamposDeFlujo);

    function actualizarCamposDeFlujo() {
        flujosDinamicosContainer.innerHTML = '';
        const tipoFlujo = tipoFlujoSelect.value;
        const vidaUtil = parseInt(vidaUtilInput.value) || 0;
        let camposHTML = '';
        switch (tipoFlujo) {
            case 'constante':
                camposHTML = `<label>Monto del Flujo Neto Constante ($):<input type="number" step="any" id="flujoConstante" class="flujo-input" placeholder="Ej: 2500" required></label>`;
                break;
            case 'gradienteAritmetico':
                camposHTML = `<label>Flujo Neto del Primer Año ($):<input type="number" step="any" id="flujoInicialGradiente" class="flujo-input" placeholder="Ej: 2000" required></label><label>Incremento Fijo por Año ($) (Gradiente):<input type="number" step="any" id="gradiente" class="flujo-input" placeholder="Ej: 250 (puede ser negativo)" required></label>`;
                break;
            case 'irregular':
                for (let i = 1; i <= vidaUtil; i++) {
                    camposHTML += `<label>Flujo Neto del Año ${i} ($):<input type="number" step="any" id="flujo_anual_${i}" class="flujo-input" required></label>`;
                }
                break;
        }
        flujosDinamicosContainer.innerHTML = camposHTML;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("Botón 'Calcular' presionado. Iniciando proceso...");
        resultadoDiv.classList.remove('visible');
        resultadoDiv.innerHTML = '';

        console.log("Iniciando recolección de datos del formulario...");
        const datos = {
            inversion: getNumericValue('inversion'),
            vidaUtil: parseInt(getNumericValue('vidaUtil', 1)),
            salvamento: getNumericValue('salvamento'),
            tasaNominal: getNumericValue('tasaNominal'),
            periodoCap: document.getElementById('periodoCap').value,
            tipoFlujo: tipoFlujoSelect.value,
            flujos: {}
        };
        console.log("Datos estáticos recolectados:", datos);

        const tipoFlujo = datos.tipoFlujo;
        if (tipoFlujo === 'constante') {
            datos.flujos.constante = getNumericValue('flujoConstante');
        } else if (tipoFlujo === 'gradienteAritmetico') {
            datos.flujos.inicial = getNumericValue('flujoInicialGradiente');
            datos.flujos.gradiente = getNumericValue('gradiente');
        } else if (tipoFlujo === 'irregular') {
            datos.flujos.irregulares = [];
            for (let i = 1; i <= datos.vidaUtil; i++) {
                datos.flujos.irregulares.push(getNumericValue(`flujo_anual_${i}`));
            }
        }
        console.log("Datos completos recolectados:", datos);

        console.log("Enviando datos al servidor...");
        try {
            const res = await fetch('/api/vfn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });
            console.log("Respuesta del servidor recibida. Estado:", res.status);

            if (!res.ok) {
                const errorData = await res.json();
                console.error("El servidor respondió con un error:", errorData);
                throw new Error(errorData.detail || 'Error del servidor');
            }

            const data = await res.json();
            console.log("Datos calculados recibidos:", data);
            
            let resultadoHTML = `<p><strong>Valor Actual Neto (VAN):</strong> $${data.van.toLocaleString('es-BO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p><p><strong>Valor Futuro Neto (VFN):</strong> $${data.vfn.toLocaleString('es-BO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p><p class="recomendacion ${data.van > 0 ? 'positivo' : 'negativo'}">${data.van > 0 ? '✅ Proyecto Recomendado' : '❌ Proyecto No Recomendado'}</p>`;
            resultadoDiv.innerHTML = resultadoHTML;
            resultadoDiv.classList.add('visible');

        } catch (error) {
            console.error("Error durante la petición fetch:", error);
            resultadoDiv.innerHTML = `<p style="color: #ffbaba;"><strong>Error:</strong> ${error.message}</p>`;
            resultadoDiv.classList.add('visible');
        }
    });

    btnBorrar.addEventListener('click', () => {
        form.reset();
        resultadoDiv.classList.remove('visible');
        resultadoDiv.innerHTML = '';
        actualizarCamposDeFlujo();
        document.getElementById('inversion').focus();
    });

    actualizarCamposDeFlujo();
});