// Credenciales del proyecto TecnoInnova S.A.
const SUPABASE_URL = "https://jdxualgehibgadkddtbc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkeHVhbGdlaGliZ2Fka2RkdGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4ODQ0OTMsImV4cCI6MjA5OTQ2MDQ5M30.KtjQlJqEdn5YB3CeBmtYvqyzt3aCofhEbH-9jOkLgGE";

window.supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Al cargar la página preparamos los formularios y mostramos estado inicial de tablas
document.addEventListener("DOMContentLoaded", () => {
    configurarFormularios();
    limpiarTablas("Inicia sesión como Administrador para visualizar los datos del sistema.");
});

// Mensaje en las tablas
function limpiarTablas(mensaje) {
    const tbodies = document.querySelectorAll("tbody");
    tbodies.forEach(tbody => {
        tbody.innerHTML = `<tr><td colspan='5' style='text-align:center; color: #888;'>${mensaje}</td></tr>`;
    });
}

// Obtener y renderizar los equipos de seguridad
async function cargarInventario() {
    if (!window.supabaseClient) return;

    const { data: articulos, error } = await window.supabaseClient
        .from('inventario')
        .select('*');

    if (error) {
        console.error("Error al consultar el inventario:", error);
        return;
    }

    const tbodies = document.querySelectorAll("tbody");
    if (tbodies.length === 0) return;

    const tbody = tbodies[0];
    tbody.innerHTML = "";
    articulos.forEach(art => {
        const fila = `
            <tr>
                <td><strong>${art.nombre_equipo}</strong></td>
                <td>${art.categoria}</td>
                <td>$${art.precio_venta}</td>
                <td>${art.stock} uds.</td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}

// Obtener y renderizar el control de pedidos
async function cargarPedidos() {
    if (!window.supabaseClient) return;

    const { data: listadoPedidos, error } = await window.supabaseClient
        .from('pedidos')
        .select('*');

    if (error) {
        console.error("Error al consultar pedidos:", error);
        return;
    }

    const tbodies = document.querySelectorAll("tbody");
    const tbody = tbodies[1] || tbodies[0];
    if (!tbody) return;

    tbody.innerHTML = "";
    listadoPedidos.forEach(ped => {
        const fila = `
            <tr>
                <td>Pedido #${ped.id}</td>
                <td>$${ped.total_facturado}</td>
                <td><span class="badge ${ped.estado ? ped.estado.toLowerCase().replace(' ', '-') : ''}">${ped.estado}</span></td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}

// Manejar el Registro y el Login
function configurarFormularios() {
    // Registrar nuevo usuario/empleado (por defecto asigna rol 'Usuario' o 'Vendedor')
    const regForm = document.getElementById("register-form");
    if (regForm) {
        regForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nombre = document.getElementById("reg-nombre").value;
            const email = document.getElementById("reg-email").value;
            const contrasena = document.getElementById("reg-password").value;

            const { data, error } = await window.supabaseClient
                .from('usuarios')
                .insert([{ nombre, email, contrasena, rol: 'Usuario' }]);

            if (error) {
                alert("Error al registrar: " + error.message);
            } else {
                alert("¡Usuario registrado con éxito en TecnoInnova S.A.!");
                regForm.reset();
            }
        });
    }

    // Login en el sistema
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            const contrasena = document.getElementById("login-password").value;

            const { data: usuarios, error } = await window.supabaseClient
                .from('usuarios')
                .select('*')
                .eq('email', email)
                .eq('contrasena', contrasena);

            if (error || !usuarios || usuarios.length === 0) {
                alert("Acceso denegado. Verifica los datos introducidos.");
            } else {
                const usuario = usuarios[0];
                
                // VALIDACIÓN DE ROL:
                if (usuario.rol === 'Administrador' || usuario.rol === 'admin') {
                    alert(`¡Acceso concedido! Bienvenido/a Administrador/a, ${usuario.nombre}.`);
                    await cargarInventario();
                    await cargarPedidos();
                } else {
                    alert(`Bienvenido/a, ${usuario.nombre}. Tu rol es (${usuario.rol || 'Usuario'}). No tienes permisos de Administrador para ver los datos.`);
                    limpiarTablas("Acceso denegado: Se requieren permisos de Administrador.");
                }

                loginForm.reset();
            }
        });
    }
}
