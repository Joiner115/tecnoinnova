// Credenciales del proyecto jdxualgehibgadkddtbc de TecnoInnova S.A.
const SUPABASE_URL = "https://jdxualgehibgadkddtbc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkeHVhbGdlaGliZ2Fka2RkdGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4ODQ0OTMsImV4cCI6MjA5OTQ2MDQ5M30.KtjQlJqEdn5YB3CeBmtYvqyzt3aCofhEbH-9jOkLgGE";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cargar los datos globales al iniciar la app
document.addEventListener("DOMContentLoaded", () => {
    cargarInventario();
    cargarPedidos();
    configurarFormularios();
});

// Obtener y renderizar los equipos de seguridad
async function cargarInventario() {
    const { data: articulos, error } = await supabase
        .from('inventario')
        .select('*');

    if (error) {
        console.error("Error al consultar el inventario:", error);
        return;
    }

    const tbody = document.querySelector("#tabla-inventario tbody");
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
    const { data: listadoPedidos, error } = await supabase
        .from('pedidos')
        .select('*');

    if (error) {
        console.error("Error al consultar pedidos:", error);
        return;
    }

    const tbody = document.querySelector("#tabla-pedidos tbody");
    tbody.innerHTML = "";
    listadoPedidos.forEach(ped => {
        const fila = `
            <tr>
                <td>Pedido #${ped.id}</td>
                <td>$${ped.total_facturado}</td>
                <td><span class="badge ${ped.estado.toLowerCase().replace(' ', '-')}">${ped.estado}</span></td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });
}

// Manejar el Registro y el Login
function configurarFormularios() {
    // Registrar nuevo usuario/empleado
    document.getElementById("register-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const nombre = document.getElementById("reg-nombre").value;
        const email = document.getElementById("reg-email").value;
        const contrasena = document.getElementById("reg-password").value;

        const { data, error } = await supabase
            .from('usuarios')
            .insert([{ nombre, email, contrasena }]);

        if (error) {
            alert("Error al registrar: " + error.message);
        } else {
            alert("¡Personal registrado con éxito en TecnoInnova S.A.!");
            document.getElementById("register-form").reset();
        }
    });

    // Login en el sistema
    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const contrasena = document.getElementById("login-password").value;

        const { data: usuarios, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('contrasena', contrasena);

        if (error || !usuarios || usuarios.length === 0) {
            alert("Acceso denegado. Verifica los datos introducidos.");
        } else {
            alert(`¡Acceso concedido! Bienvenido/a, ${usuarios[0].nombre}.`);
            document.getElementById("login-form").reset();
        }
    });
}
