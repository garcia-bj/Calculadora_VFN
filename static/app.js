// Este archivo controla la interacción de la calculadora de Valor Futuro Neto (VFN) en la página web.
// Está pensado para que cualquier persona pueda entender cómo funciona, aunque no tenga experiencia en programación.

// Espera a que la página esté completamente cargada antes de ejecutar el código
// Esto asegura que todos los elementos del formulario existen y están listos para usarse
//
document.addEventListener('DOMContentLoaded', () => {
    // Obtenemos el formulario y el área donde se mostrará el resultado
    const form = document.getElementById('formulario');
    const resultado = document.getElementById('resultado');

    // Cuando el usuario hace clic en "Calcular" (envía el formulario):
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita que la página se recargue automáticamente
        resultado.classList.remove('visible'); // Oculta el resultado anterior
        resultado.textContent = ''; // Limpia el texto del resultado anterior

        // Tomamos los valores que el usuario ingresó en los campos
        const flujo = document.getElementById('flujo').value; // El flujo de caja
        const tasa = document.getElementById('tasa').value; // La tasa de descuento
        const periodos = document.getElementById('periodos').value; // El número de periodos

        // Creamos un objeto con los datos para enviar al servidor
        const datos = { flujo, tasa, periodos };

        try {
            // Enviamos los datos al servidor usando una petición POST
            // El servidor hace el cálculo y nos regresa el resultado
            const res = await fetch('/api/vfn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos) // Convertimos los datos a texto para enviarlos
            });
            const data = await res.json(); // Recibimos la respuesta del servidor y la convertimos a objeto

            // Mostramos el resultado al usuario, ya con el cálculo hecho
            resultado.textContent = `Valor Futuro Neto: $${data.vfn}`;
            resultado.classList.add('visible'); // Hace visible el recuadro del resultado
        } catch (error) {
            // Si ocurre un error (por ejemplo, el servidor no responde), avisamos al usuario
            resultado.textContent = 'Error al calcular. Intenta de nuevo.';
            resultado.classList.add('visible');
        }
    });

    // Funcionalidad del botón "Borrar":
    // Cuando el usuario hace clic en "Borrar", se limpian todos los campos y el resultado
    const btnBorrar = document.getElementById('borrar');
    btnBorrar.addEventListener('click', () => {
        form.reset(); // Limpia todos los campos del formulario
        resultado.classList.remove('visible'); // Oculta el resultado
        resultado.textContent = '';
        document.getElementById('flujo').focus(); // Pone el cursor en el primer campo para facilitar el ingreso de nuevos datos
    });
});
