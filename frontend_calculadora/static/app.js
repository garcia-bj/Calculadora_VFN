// ===================================================================================
//  Archivo: app.js
//  Propósito: Controla toda la interacción y lógica del frontend de la calculadora.
//  Versión Definitiva: 6.1 (Corrección del Botón Borrar)
// ===================================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Selección de Elementos del DOM ---
    const form = document.getElementById('formulario');
    const resultadoDiv = document.getElementById('resultado');
    const flujosDinamicosContainer = document.getElementById('flujosDinamicosContainer');
    const btnBorrar = document.getElementById('borrar');

    // === LÓGICA DEL GRÁFICO (CHART.JS) ===
    const ctx = document.getElementById('flujosChart').getContext('2d');

    const positiveGradient = ctx.createLinearGradient(0, 0, 0, 200);
    positiveGradient.addColorStop(0, 'rgba(24, 90, 219, 0.8)');
    positiveGradient.addColorStop(1, 'rgba(10, 25, 49, 0.5)');

    const negativeGradient = ctx.createLinearGradient(0, 0, 0, 200);
    negativeGradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
    negativeGradient.addColorStop(1, 'rgba(10, 25, 49, 0.5)');

    let flujosChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Flujo de Caja Neto ($)',
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 2,
                borderRadius: 5,
                hoverBackgroundColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            },
            scales: {
                y: {
                    border: { display: false },
                    grid: { color: 'rgba(24, 90, 219, 0.2)' },
                    ticks: { 
                        color: '#bdc8e2',
                        font: { family: "'Segoe UI', system-ui", weight: '600' }
                    }
                },
                x: {
                    border: { display: false },
                    grid: { display: false },
                    ticks: { 
                        color: '#bdc8e2',
                        font: { family: "'Segoe UI', system-ui", weight: '600' }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(10, 25, 49, 0.9)',
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 12 },
                    padding: 10,
                    cornerRadius: 8
                }
            }
        }
    });
    
    // --- Función Auxiliar para obtener valores numéricos ---
    function getNumericValue(elementId, defaultValue = 0) {
        const element = document.getElementById(elementId);
        if (!element) return defaultValue;
        const parsedValue = parseFloat(element.value);
        return isNaN(parsedValue) ? defaultValue : parsedValue;
    }

    // --- Lógica de la Interfaz ---
    function actualizarCamposDeFlujo() {
        flujosDinamicosContainer.innerHTML = '';
        const tipoFlujo = document.getElementById('tipoFlujo').value;
        const vidaUtil = parseInt(document.getElementById('vidaUtil').value) || 0;
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

    // --- Función para actualizar el gráfico ---
    function actualizarGrafico() {
        const vidaUtil = getNumericValue('vidaUtil', 0);
        const inversion = getNumericValue('inversion');
        const tipoFlujo = document.getElementById('tipoFlujo').value;

        const labels = ['Año 0'];
        const data = [-inversion];
        const backgroundColors = [negativeGradient];
        const borderColors = ['#ff0000'];

        let flujosAnuales = [];
        if (tipoFlujo === 'constante') {
            const flujoConstante = getNumericValue('flujoConstante');
            for (let i = 0; i < vidaUtil; i++) flujosAnuales.push(flujoConstante);
        } else if (tipoFlujo === 'gradienteAritmetico') {
            const flujoInicial = getNumericValue('flujoInicialGradiente');
            const gradiente = getNumericValue('gradiente');
            for (let i = 0; i < vidaUtil; i++) flujosAnuales.push(flujoInicial + i * gradiente);
        } else if (tipoFlujo === 'irregular') {
            for (let i = 1; i <= vidaUtil; i++) flujosAnuales.push(getNumericValue(`flujo_anual_${i}`));
        } else {
             for (let i = 0; i < vidaUtil; i++) flujosAnuales.push(0);
        }
        
        if (vidaUtil > 0 && flujosAnuales.length > 0) {
            const salvamento = getNumericValue('salvamento');
            flujosAnuales[vidaUtil-1] += salvamento;
        }

        for (let i = 1; i <= vidaUtil; i++) {
            labels.push(`Año ${i}`);
            const flujoNeto = flujosAnuales[i-1] || 0;
            data.push(flujoNeto);
            backgroundColors.push(flujoNeto >= 0 ? positiveGradient : negativeGradient);
            borderColors.push(flujoNeto >= 0 ? '#185adb' : '#ff0000');
        }
        
        flujosChart.data.labels = labels;
        flujosChart.data.datasets[0].data = data;
        flujosChart.data.datasets[0].backgroundColor = backgroundColors;
        flujosChart.data.datasets[0].borderColor = borderColors;
        flujosChart.update();
    }
    
    // --- Event Listeners ---
    form.addEventListener('input', (e) => {
        if (e.target.id === 'tipoFlujo' || e.target.id === 'vidaUtil') {
            actualizarCamposDeFlujo();
        }
        actualizarGrafico();
    });

    // --- Lógica de Envío del Formulario ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        resultadoDiv.classList.remove('visible');
        resultadoDiv.innerHTML = '';

        const datos = {
            inversion: getNumericValue('inversion'),
            vidaUtil: parseInt(getNumericValue('vidaUtil', 1)),
            salvamento: getNumericValue('salvamento'),
            tasaNominal: getNumericValue('tasaNominal'),
            periodoCap: document.getElementById('periodoCap').value,
            tipoFlujo: document.getElementById('tipoFlujo').value,
            flujos: {}
        };

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
        
        try {
            const res = await fetch('/api/vfn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || 'Error del servidor');
            }

            const data = await res.json();
            
            let resultadoHTML = `<p><strong>Valor Actual Neto (VAN):</strong> $${data.van.toLocaleString('es-BO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p><p><strong>Valor Futuro Neto (VFN):</strong> $${data.vfn.toLocaleString('es-BO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p><p class="recomendacion ${data.van > 0 ? 'positivo' : 'negativo'}">${data.van > 0 ? '✅ Proyecto Recomendado' : '❌ Proyecto No Recomendado'}</p>`;
            resultadoDiv.innerHTML = resultadoHTML;
            resultadoDiv.classList.add('visible');

        } catch (error) {
            resultadoDiv.innerHTML = `<p style="color: #ffbaba;"><strong>Error:</strong> ${error.message}</p>`;
            resultadoDiv.classList.add('visible');
        }
    });

    // === LÓGICA CORREGIDA DEL BOTÓN BORRAR ===
    btnBorrar.addEventListener('click', () => {
        form.reset(); // Limpia todos los campos del formulario.
        resultadoDiv.classList.remove('visible');
        resultadoDiv.innerHTML = '';
        actualizarCamposDeFlujo(); // Llama a la función para limpiar los campos dinámicos.
        actualizarGrafico(); // AÑADIDO: Llama explícitamente a actualizar el gráfico.
        document.getElementById('inversion').focus();
    });

    // --- Inicialización al cargar la página ---
    actualizarCamposDeFlujo();
});
