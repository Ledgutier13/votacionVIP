// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AlzaSyB1qWP8M3jEaux1JqzCOz-zb-ki9MumwyY",
    authDomain: "votaciononline-502dd.firebaseapp.com",
    databaseURL: "https://votaciononline-502dd-default-rtdb.firebaseio.com",
    projectId: "votaciononline-502dd",
    storageBucket: "votaciononline-502dd.appspot.com",
    messagingSenderId: "2239640995350",
    appId: "1:2239640995350:web:xxxxxxxxxxxxxxxx"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Variables globales
let votos = { si: 0, no: 0, abstenerse: 0 };
let opcionSeleccionada = null;
let grafica;
const usuarios = {
    cher2024: { contrasena: '2024', haVotado: false },
    sua2024: { contrasena: '2024', haVotado: false },
    sel2024: { contrasena: '2024', haVotado: false },
    mar2024: { contrasena: '2024', haVotado: false },
    led2024: { contrasena: '2024', haVotado: false }
};
let usuarioActual = null;

// Funciones para interactuar con Firebase Realtime Database
async function cargarDatos() {
    const snapshot = await db.ref('votacion').once('value');
    const data = snapshot.val();
    if (data) {
        votos = data.votos;
        Object.assign(usuarios, data.usuarios);
        document.getElementById('titulo').innerText = data.titulo;
        document.getElementById('descripcion').innerText = data.descripcion;
    }
}

async function guardarDatos() {
    await db.ref('votacion').set({
        votos: votos,
        usuarios: usuarios,
        titulo: document.getElementById('titulo').innerText,
        descripcion: document.getElementById('descripcion').innerText
    });
}

async function borrarVotacion() {
    votos = { si: 0, no: 0, abstenerse: 0 };
    for (let usuario in usuarios) {
        usuarios[usuario].haVotado = false;
    }
    await guardarDatos();
    alert('La votación ha sido borrada.');
    mostrarPagina('inicio');
}

// Funciones de la aplicación
function mostrarPagina(pagina) {
    document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
    document.getElementById(pagina).style.display = 'block';
}

function seleccionarOpcion(opcion) {
    opcionSeleccionada = opcion;
    document.querySelectorAll('#votacion button').forEach(btn => btn.classList.remove('seleccionado'));
    document.getElementById(`btn-${opcion}`).classList.add('seleccionado');
}

async function enviarVoto() {
    if (opcionSeleccionada) {
        votos[opcionSeleccionada]++;
        usuarios[usuarioActual].haVotado = true;
        await guardarDatos();
        document.getElementById('confirmacion').style.display = 'block';
        setTimeout(() => {
            mostrarPagina('inicio');
            document.getElementById('verResultadosInicio').style.display = 'block';
        }, 1000);
    } else {
        alert('Por favor, selecciona una opción antes de enviar tu voto.');
    }
}

function guardarTexto() {
    const nuevoTitulo = document.getElementById('nuevoTitulo').value;
    const nuevaDescripcion = document.getElementById('nuevaDescripcion').value;
    document.getElementById('titulo').innerText = nuevoTitulo;
    document.getElementById('descripcion').innerText = nuevaDescripcion;
    guardarDatos();
    mostrarPagina('inicio');
}

function verificarCredenciales() {
    const usuario = document.getElementById('usuario').value;
    const contrasena = document.getElementById('contrasena').value;
    if (usuario === 'led2024' && contrasena === '2024') {
        mostrarPagina('resultados');
        mostrarResultados();
    } else {
        document.getElementById('mensajeError').style.display = 'block';
    }
}

function verificarCredencialesEditar() {
    const usuario = document.getElementById('usuarioEditar').value;
    const contrasena = document.getElementById('contrasenaEditar').value;
    if (usuario === 'led2024' && contrasena === '2024') {
        mostrarPagina('editar');
    } else {
        document.getElementById('mensajeErrorEditar').style.display = 'block';
    }
}

function verificarCredencialesVotar() {
    const usuario = document.getElementById('usuarioVotar').value;
    const contrasena = document.getElementById('contrasenaVotar').value;
    if (usuarios[usuario] && usuarios[usuario].contrasena === contrasena) {
        if (usuarios[usuario].haVotado) {
            mostrarDialogo('yaVotoDialog');
        } else {
            usuarioActual = usuario;
            mostrarPagina('votacion');
        }
    } else {
        document.getElementById('mensajeErrorVotar').style.display = 'block';
    }
}

async function cambiarContrasena() {
    const usuario = document.getElementById('usuarioCambiar').value;
    const contrasenaActual = document.getElementById('contrasenaActual').value;
    const nuevaContrasena = document.getElementById('nuevaContrasena').value;

    if (usuarios[usuario] && usuarios[usuario].contrasena === contrasenaActual) {
        usuarios[usuario].contrasena = nuevaContrasena;
        await guardarDatos();
        alert('Contraseña cambiada exitosamente.');
        mostrarPagina('loginVotar');
    } else {
        document.getElementById('mensajeErrorCambiar').style.display = 'block';
    }
}

function mostrarResultados() {
    const totalVotos = votos.si + votos.no + votos.abstenerse;
    const porcentajes = {
        si: ((votos.si / totalVotos) * 100).toFixed(2),
        no: ((votos.no / totalVotos) * 100).toFixed(2),
        abstenerse: ((votos.abstenerse / totalVotos) * 100).toFixed(2)
    };

    document.getElementById('porcentajes').innerText = `Sí: ${porcentajes.si}%, No: ${porcentajes.no}%, Abstenerse: ${porcentajes.abstenerse}%`;
    document.getElementById('totalVotos').innerText = `Total de votos: ${totalVotos}`;

    const ctx = document.getElementById('grafica').getContext('2d');

    if (grafica) {
        grafica.destroy();
    }

    grafica = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Sí', 'No', 'Abstenerse'],
            datasets: [{
                label: 'Votos',
                data: [votos.si, votos.no, votos.abstenerse],
                backgroundColor: ['#4caf50', '#f44336', '#ffeb3b'],
                borderColor: ['#388e3c', '#d32f2f', '#fbc02d'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function mostrarDialogo(dialogoId) {
    document.getElementById(dialogoId).style.display = 'block';
}

function cerrarDialogo(dialogoId) {
    document.getElementById(dialogoId).style.display = 'none';
}

// Cargar datos al iniciar
window.onload = function() {
    cargarDatos();
};
