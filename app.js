// Credenciales del proyecto TecnoInnova S.A.
const SUPABASE_URL = "https://jdxualgehibgadkddtbc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkeHVhbGdlaGliZ2Fka2RkdGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4ODQ0OTMsImV4cCI6MjA5OTQ2MDQ5M30.KtjQlJqEdn5YB3CeBmtYvqyzt3aCofhEbH-9jOkLgGE";

window.supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Inicialización de la aplicación
document.addEventListener("DOMContentLoaded", () => {
    configurarFormularios();
    estadoInicialVistas();
});

// Mensaje por defecto en las tablas antes de autenticarse
function estadoInicialVistas() {
    const tbodies = document.querySelectorAll("tbody");
    tbodies.forEach(tbody => {
        tbody.innerHTML = "<tr><td colspan='5' style='text-align:center; color: #888;'>Inicia sesión para consultar la información del sistema.</td></tr>";
    });
}

// Cargar la vista completa para Administradores (Equipos + Pedidos/Técnicos)
async function cargarVistaAdmin() {
    if (!window.supabaseClient) return;

    // 1. Cargar Equipos de Seguridad
    const { data: articulos } = await window.supabaseClient.from('inventario').select('*');
    const tbodies = document.querySelectorAll("tbody");

    if (tbodies.length > 0 && articulos) {
        tbodies[0].innerHTML = "";
        articulos.forEach(art => {
            tbodies[0].innerHTML += `
                <tr>
                    <td><strong>${art.nombre_equipo}</strong></td>
                    <td>${art.categoria}</td>
                    <td>$${art.precio_venta}</td>
                    <td>${art.stock} uds.</td>
                </tr>
            `;
        });
    }

    // 2. Cargar Pedidos y Asignación
    await cargarGestionPedidos(true);
}

// Cargar la vista restringida para Usuario Normal (Solo Pedidos/Técnicos)
async function cargarVistaUsuario() {
    const tbodies = document.querySelectorAll("tbody");

    // Bloquear/ocultar la primera tabla (Equipos de Seguridad)
    if (tbodies.length > 0) {
        tbodies[0].innerHTML = "<tr><td colspan='4' style='text-align:center; color: #d9534f; font-weight: bold;'>Acceso restringido: Se requieren permisos de Administrador para ver los equipos.</td></tr>";
    }

    // Permitir acceso total a Gestión de Pedidos y Asignación de Técnicos
    await cargarGestionPedidos(false);
}

// Obtener y renderizar el control de pedidos con acción de asignación de técnicos
async function cargarGestionPedidos(esAdmin) {
    if (!window.supabaseClient) return;

    const { data: listadoPedidos, error } = await window.supabaseClient.from('pedidos').select('*');
    if (error) return;

    const tbodies = document.querySelectorAll("tbody");
    const tbodyPedidos = tbodies[1] || tbodies[0];
    if (!tbodyPedidos) return;

    tbodyPedidos.innerHTML = "";
    listadoPedidos.forEach(ped => {
        tbodyPedidos.innerHTML += `
            <tr>
                <td>Pedido #${ped.id}</td>
                <td>$${ped.total_facturado}</td>
                <td><span class="badge ${ped.estado ? ped.estado.toLowerCase().replace(' ', '-') : ''}">${ped.estado}</span></td>
                <td>
                    <button onclick="asignarTecnico(${ped.id})" style="padding: 4px 8px; cursor: pointer; background-color: #007bff; color: white; border: none; border-radius: 4px;">
                        Asignar Técnico
                    </button>
                </td>
            </tr>
        `;
    });
}

// Función global interactiva para la asignación de técnicos
window.asignarTecnico = function(idPedido) {
    const tecnico = prompt(`Ingrese el nombre o ID del técnico asignado al Pedido #${idPedido}:`);
    if (tecnico && tecnico.trim() !== "") {
        alert(`Técnico "${tecnico}" asignado con éxito al Pedido #${idPedido}.`);
    }
};

// Configurar comportamiento de login y registro
function configurarFormularios() {
    const regForm = document.getElementById("register-form");
    if (regForm) {
        regForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nombre = document.getElementById("reg-nombre").value;
            const email = document.getElementById("reg-email").value;
            const contrasena = document.getElementById("reg-password").value;

            const { error } = await window.supabaseClient
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
                alert("Acceso denegado. Verifica las credenciales.");
            } else {
                const usuario = usuarios[0];
                const esAdmin = usuario.rol === 'Administrador' || usuario.rol === 'admin';

                if (esAdmin) {
                    alert(`¡Acceso de Administrador concedido! Bienvenido/a, ${usuario.nombre}.`);
                    await cargarVistaAdmin();
                } else {
                    alert(`¡Acceso Concedido! Bienvenido/a, ${usuario.nombre}. Rol: Usuario Normal.`);
                    await cargarVistaUsuario();
                }

                loginForm.reset();
            }
        });
    }
}
