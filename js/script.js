"use strict";

// Traer elementos de HTML
const tablero = document.getElementById("tableroJuego");
const contadorIntentos = document.getElementById("intentos");
const botonReinicio = document.getElementById("botonReiniciar");
const mensajeGanador = document.getElementById("mensajeGanador");

const pantallaInicio = document.getElementById("pantallaInicio");
const nombreInput = document.getElementById("nombreJugador");
const btnIniciar = document.getElementById("btnIniciar");
const containerJuego = document.querySelector(".container");
const dificultadSelect = document.getElementById("dificultad"); // Selector de dificultad

const btnClasico = document.getElementById("modoClasico");
const btnInverso = document.getElementById("modoInverso");
const btnAtras = document.getElementById("botonAtras");

//Sonidos
const sonidoSeleccionCarta = new Audio("./audio/card01.mp3");
const sonidoErrorCarta = new Audio("./audio/error01.mp3");
const sonidoAciertoCarta = new Audio("./audio/matchedCards01.mp3");
const sonidoClick = new Audio("./audio/click02.mp3");
const sonidoGanar = new Audio("./audio/win01.mp3");

// Declaración de variables
const emojis = [
    "🙉",
    "🚀",
    "🌈",
    "🍉",
    "⛔️",
    "🏀",
    "💵",
    "🎁",
    "🎉",
    "🌟",
    "🍀",
    "❤️",
];
const parejasOpuestas = [
    ["🔥", "💧"],
    ["🌞", "🌚"],
    ["😀", "😡"],
    ["👆", "👇"],
    ["🎵", "🔇"],
    ["🐇", "🐢"],
    ["🔐", "🔓"],
    ["🛸", "🌍"], //cambiar algunos si no se entiende
    ["😇", "😈"],
    ["🌋", "🗻"],
    ["👴", "👶"],
    ["✈", "🚢"],
];
let cartas = [];
let cartasGiradas = [];
let intentos = 0;
let firstCard = null;
let secondCard = null;
let paresDescubiertos = 0;
let temporizador; // Variable para almacenar el temporizador
let tiempoRestante = 60; // 60 segundos de tiempo para el juego
let modoActual = "clasico"; //marcar el modo de juego
let tiempoMostrar = 0;
let nombreJugador = "";

// Función para mezclar array
const mezclarCartas = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

function generarTablero() {
    tablero.innerHTML = ""; // Para empezar vacío
    const filas = Math.ceil(cartas.length / 4); // Calcular el número de filas según la cantidad de cartas
    const columnas = window.innerWidth < 800 ? 2 : 4; // Cambiar a 2 columnas si el ancho es menor a 800px
    tablero.style.gridTemplateColumns = `repeat(${columnas}, 100px)`; // Mantener 2 o 4 columnas

    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            const index = i * columnas + j; // Calcular el índice de la carta
            if (index < cartas.length) {
                // Verificar que el índice no exceda la cantidad de cartas
                const carta = document.createElement("div");
                carta.classList.add("carta");
                carta.dataset.emoji = cartas[index]; //guardar el dato del emoji en la carta
                carta.dataset.indice = index; //guardar el dato del indice emoji en el array

                // Crear la cara back y front de la carta
                const frontFace = document.createElement("div");
                frontFace.classList.add("cara", "front");
                frontFace.textContent = "";

                const backFace = document.createElement("div");
                backFace.classList.add("cara", "back");
                backFace.textContent = "❔"; // Puedes usar un ícono o dejarlo vacío

                // Añadir las caras a la carta
                carta.appendChild(frontFace);
                carta.appendChild(backFace);

                carta.addEventListener("click", handleCardClick); // Girar la carta cuando se hace clic
                tablero.appendChild(carta); // Añadir como hijo al tablero cada carta
            }
        }
    }

    // Reiniciar variables
    firstCard = null;
    secondCard = null;
    cartasGiradas = [];
    intentos = 0;
    contadorIntentos.textContent = intentos;
}

// Función para voltear la carta
function flipCard(carta) {
    if (carta.classList.contains("flipped") || cartasGiradas.length >= 2)
        return;

    carta.classList.add("flipped"); // Esto activa el giro

    const frontFace = carta.querySelector(".front");
    if (!frontFace.textContent) {
        // Esto evita sobrescribir el contenido si ya tiene un emoji
        frontFace.textContent = carta.dataset.emoji; // Establece el emoji solo si la carta no tiene texto
    }

    cartasGiradas.push(carta);
    if (cartasGiradas.length === 2) {
        setTimeout(verificarPareja, 1000); //al segundo comprueba si es pareja para girarla o dejarla así
    }
}

// Función que se ejecuta cuando se hace clic en una carta
function handleCardClick(event) {
    if (tablero.classList.contains("no-click")) return; // Si el tablero tiene la clase "no-click", no hacer nada

    const clickedCard = event.target.closest(".carta"); // Seleccionamos la carta completa.

    if (clickedCard.classList.contains("flipped") || secondCard) return; // Si la carta ya está volteada, no hacer nada.
    sonidoSeleccionCarta.cloneNode(true).play();
    flipCard(clickedCard);

    if (!firstCard) {
        firstCard = clickedCard;
    } else {
        secondCard = clickedCard;
        intentos++;
        contadorIntentos.textContent = intentos;
    }
}

// Función para verificar si las cartas son iguales
function verificarPareja() {
    if (cartasGiradas.length !== 2) return;

    const [carta1, carta2] = cartasGiradas; //separar el array en dos variables

    let esPareja = false;

    if (modoActual === "inverso") {
        esPareja = parejasOpuestas.some(
            ([a, b]) =>
                (carta1.dataset.emoji === a && carta2.dataset.emoji === b) ||
                (carta1.dataset.emoji === b && carta2.dataset.emoji === a)
        );
    } else {
        esPareja = carta1.dataset.emoji === carta2.dataset.emoji;
    }

    if (esPareja) {
        paresDescubiertos++;
        sonidoAciertoCarta.play();
        carta1.classList.add("pareja");
        carta2.classList.add("pareja");

        //clase para la animacion
        carta1.querySelector(".front").classList.add("pareja");
        carta2.querySelector(".front").classList.add("pareja");
    } else {
        sonidoErrorCarta.play();

        carta1.classList.add("fallo");
        carta2.classList.add("fallo");

        setTimeout(() => {
            carta1.classList.remove("fallo");
            carta2.classList.remove("fallo");
        }, 1000);

        carta1.querySelector(".front").textContent = "";
        carta2.querySelector(".front").textContent = "";

        carta1.querySelector(".back").textContent = "❔";
        carta2.querySelector(".back").textContent = "❔";

        carta1.classList.remove("flipped");
        carta2.classList.remove("flipped");
    }

    // Verificar si todas las cartas están volteadas
    if (document.querySelectorAll(".carta.flipped ").length === cartas.length) {
        setTimeout(() => {
            sonidoGanar.play();
            mensajeGanador.textContent = `¡Felicidades ${nombreJugador}! Has completado el juego en ${intentos} intentos.`;
            mensajeGanador.classList.add("ganador");
            mensajeGanador.classList.remove("perdedor");
            mensajeGanador.style.display = "block";
        }, 1000);
        clearInterval(temporizador); // Detener el temporizador
    }
    cartasGiradas = [];
    firstCard = null;
    secondCard = null;
}

// Función para iniciar el juego
function iniciarJuego() {
    tiempoRestante = 60; // Reiniciar el tiempo
    contadorIntentos.textContent = 0; // Reiniciar intentos
    mensajeGanador.textContent = ""; // Limpiar mensaje de victoria
    const dificultad = dificultadSelect.value; // Obtener la dificultad seleccionada
    establecerDificultad(dificultad); // Establecer la dificultad
    mezclarCartas(cartas);
    generarTablero();
}

// Función para establecer la dificultad
function establecerDificultad(dificultad) {
    if (modoActual === "clasico") {
        tiempoMostrar = 3000;
    } else if (modoActual === "inverso") {
        tiempoMostrar = 5000;
    } else {
        tiempoMostrar = 0;
    }
    if (modoActual === "clasico") {
        switch (dificultad) {
            case "easy":
                cartas = [...emojis.slice(0, 4), ...emojis.slice(0, 4)];
                tiempoRestante = 30;
                tiempoMostrar -= 2000;
                break;
            case "medium":
                cartas = [...emojis.slice(0, 8), ...emojis.slice(0, 8)];
                tiempoRestante = 60;
                break;
            case "hard":
                cartas = [...emojis.slice(0, 12), ...emojis.slice(0, 12)];
                tiempoRestante = 90;
                tiempoMostrar += 2000;
                break;
        }
    } else if (modoActual === "inverso") {
        switch (dificultad) {
            case "easy":
                cartas = [...parejasOpuestas.slice(0, 4).flat()];
                tiempoRestante = 30;
                tiempoMostrar -= 2000;
                break;
            case "medium":
                cartas = [...parejasOpuestas.slice(0, 8).flat()];
                tiempoRestante = 60;
                break;
            case "hard":
                cartas = [...parejasOpuestas.slice(0, 12).flat()];
                tiempoRestante = 90;
                tiempoMostrar += 2000;
                break;
        }
    }
}

// Función para reiniciar el juego
function reiniciarJuego() {
    paresDescubiertos = 0;
    mensajeGanador.style.display = "none";
    mensajeGanador.textContent = "";
    mensajeGanador.classList.remove("ganador", "perdedor");
    sonidoClick.play();
    clearInterval(temporizador); // Detener el temporizador
    iniciarJuego(); // Reiniciar el juego
    iniciarTemporizador();
}

// Función de temporizador
function iniciarTemporizador() {
    const tiempoDisplay = document.getElementById("tiempo");
    temporizador = setInterval(() => {
        tiempoRestante--;
        tiempoDisplay.textContent = tiempoRestante;
        if (tiempoRestante <= 0) {
            clearInterval(temporizador);
            mensajeGanador.textContent = `¡${nombreJugador}, se acabó el tiempo! Has perdido.`;
            mensajeGanador.classList.add("perdedor");
            mensajeGanador.classList.remove("ganador");
            mensajeGanador.style.display = "block";
            tablero.classList.add("noClick");
        }
    }, 1000);
}

// Evento de reiniciar juego
botonReinicio.addEventListener("click", () => {
    reiniciarJuego();

    tablero.classList.add("noClick");

    //Para mostrar las cartas cada vez
    document.querySelectorAll(".carta").forEach((carta) => {
        carta.classList.add("flipped");
        carta.querySelector(".front").textContent = carta.dataset.emoji;
    });

    setTimeout(() => {
        document.querySelectorAll(".carta").forEach((carta) => {
            carta.classList.remove("flipped");
            carta.querySelector(".front").textContent = "";
        });
        tablero.classList.remove("noClick");
    }, tiempoMostrar);
});

//para obtener el nombre y no seguir si no lo tiene
function obtenerNombreJugador() {
    const nombre = nombreInput.value.trim();
    if (!nombre) {
        alert("Por favor, ingresa tu nombre para comenzar.");
        return null;
    }
    return nombre;
}

//para volver a la pantalla de inicio
function volverPantallaAtras() {
    containerJuego.style.display = "none";
    pantallaInicio.style.display = "flex";
    clearInterval(temporizador);
    tablero.innerHTML = "";
    paresDescubiertos = 0;
    intentos = 0;
    contadorIntentos.textContent = intentos;
    mensajeGanador.textContent = "";
    mensajeGanador.style.display = "none";
    tiempoRestante = "⏰";
    document.getElementById("tiempo").textContent = tiempoRestante;
}

//MODOS DE JUEGO

//iniciar el juego segun el modo
function iniciarJuegoModo(modo) {
    const nombre = obtenerNombreJugador();
    if (!nombre) return; //si no hay nombre no seguir
    nombreJugador = nombre; // Guardar nombre globalmente

    pantallaInicio.style.display = "none";
    containerJuego.style.display = "flex";
    tablero.classList.add("noClick");
    modoActual = modo;
    iniciarJuego();
}

//seleccionar el modo de juego
btnClasico.addEventListener("click", () => iniciarJuegoModo("clasico"));
btnInverso.addEventListener("click", () => iniciarJuegoModo("inverso"));

btnAtras.addEventListener("click", () => volverPantallaAtras());
