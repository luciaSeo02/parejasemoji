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

//Sonidos
const sonidoSeleccionCarta = new Audio("./audio/card01.mp3");
const sonidoErrorCarta = new Audio("./audio/error01.mp3");
const sonidoAciertoCarta = new Audio("./audio/matchedCards01.mp3");
const sonidoClick = new Audio("./audio/click02.mp3");
const sonidoGanar = new Audio("./audio/win01.mp3");

// Declaración de variables
const emojis = ["🙉", "🚀", "🌈", "🍉", "⛔️", "🏀", "💵", "🎁"];
let cartas = [...emojis, ...emojis];
let cartasGiradas = [];
let intentos = 0;
let firstCard = null;
let secondCard = null;
let paresDescubiertos = 0;
let temporizador; // Variable para almacenar el temporizador
let tiempoRestante = 60; // 60 segundos de tiempo para el juego

// Función para mezclar array
const mezclarCartas = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Función para generar tablero
function generarTablero() {
  tablero.innerHTML = ""; // Para empezar vacío
  cartas.forEach((emoji, indice) => {
    const carta = document.createElement("div");
    carta.classList.add("carta");
    carta.dataset.emoji = emoji; //guardar el dato del emoji en la carta
    carta.dataset.indice = indice; //guardar el dato del indice emoji en el array

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
  });

  //Reiniciar variables
  firstCard = null;
  secondCard = null;
  cartasGiradas = [];
  intentos = 0;
  contadorIntentos.textContent = intentos;
}

// Función para voltear la carta
function flipCard(carta) {
  if (carta.classList.contains("flipped") || cartasGiradas.length >= 2) return;

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
  if (tablero.classList.contains("no-click")) {
    return; // Si el tablero tiene la clase "no-click", no hacer nada
  }

  const clickedCard = event.target.closest(".carta"); // Seleccionamos la carta completa.

  if (clickedCard.classList.contains("flipped") || secondCard) return; // Si la carta ya está volteada, no hacer nada.
  const sonido = sonidoSeleccionCarta.cloneNode(true);
  sonido.play();
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

  if (carta1.dataset.emoji === carta2.dataset.emoji) {
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
    }, 1000);
    clearInterval(temporizador); // Detener el temporizador
  }
  cartasGiradas = [];
  firstCard = null;
  secondCard = null;

  if (paresDescubiertos === 8) {
    setTimeout(() => {
      let mensaje = `¡Felicidades! Has completado el juego en ${intentos} intentos.`;
      if (intentos === 8) {
        mensaje += " ¡Puntuación perfecta! 🎉";
      }
      mensajeGanador.textContent = mensaje;
      mensajeGanador.style.display = "block";
    }, 500);
  }
}

// Función para iniciar el juego
function iniciarJuego() {
  tiempoRestante = 60; // Reiniciar el tiempo
  contadorIntentos.textContent = 0; // Reiniciar intentos
  mensajeGanador.textContent = ""; // Limpiar mensaje de victoria
  mezclarCartas(cartas);
  generarTablero();
  iniciarTemporizador(); // Iniciar temporizador
}

// Función para reiniciar el juego
function reiniciarJuego() {
  paresDescubiertos = 0;
  mensajeGanador.style.display = "none";
  mensajeGanador.textContent = "";
  sonidoClick.play();
  clearInterval(temporizador); // Detener el temporizador
  iniciarJuego(); // Reiniciar el juego
}

// Función de temporizador
function iniciarTemporizador() {
  const tiempoDisplay = document.getElementById("tiempo");
  temporizador = setInterval(() => {
    tiempoRestante--;
    tiempoDisplay.textContent = tiempoRestante;
    if (tiempoRestante <= 0) {
      clearInterval(temporizador);
      mensajeGanador.textContent = "¡Se acabó el tiempo! Has perdido.";
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
  }, 3000);
});

btnIniciar.addEventListener("click", () => {
  const nombre = nombreInput.value.trim();
  if (nombre) {
    pantallaInicio.style.display = "none"; // Ocultar la pantalla de inicio
    containerJuego.style.display = "flex"; // Mostrar el juego
    tablero.classList.add("noClick");
    mezclarCartas(cartas);
    generarTablero();
  } else {
    alert("Por favor, ingresa tu nombre para comenzar.");
  }
});
