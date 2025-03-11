"use strict";

//Traer elementos de HTML
const tablero = document.getElementById("tableroJuego");
const contadorIntentos = document.getElementById("intentos");
const botonReinicio = document.getElementById("botonReiniciar");
const mensajeGanador = document.getElementById("mensajeGanador");

//Sonidos
const sonidoSeleccionCarta = new Audio("./audio/card01.mp3");
const sonidoErrorCarta = new Audio("./audio/error01.mp3");
const sonidoAciertoCarta = new Audio("./audio/matchedCards01.mp3");
const sonidoClick = new Audio("./audio/click01.mp3");
const sonidoGanar = new Audio("./audio/win01.mp3");

//Declaración variables
const emojis = ["🙉", "🚀", "🌈", "🍉", "⛔️", "🏀", "💵", "🎁"];

let cartas = [...emojis, ...emojis];
let cartasGiradas = [];
let intentos = 0;
let firstCard = null;
let secondCard = null;

// Función para mezclar array
const mezclarCartas = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

//FUNCIÓN PARA GENERAR TABLERO
function generarTablero() {
  tablero.innerHTML = ""; //para empezar vacío
  cartas.forEach((emoji, indice) => {
    const carta = document.createElement("div");
    carta.classList.add("carta");
    carta.dataset.emoji = emoji; //guardar el dato del emoji en la carta
    carta.dataset.indice = indice; //guardar el dato del indice emoji en el array

    //Crear la cara back y front de la carta

    const frontFace = document.createElement("div");
    frontFace.classList.add("cara", "front");
    frontFace.textContent = emoji;

    const backFace = document.createElement("div");
    backFace.classList.add("cara", "back");
    backFace.textContent = "❔"; // Puedes usar un ícono o dejarlo vacío

    // Añadir las caras a la carta
    carta.appendChild(frontFace);
    carta.appendChild(backFace);

    carta.addEventListener("click", handleCardClick); //girar la carta cuando clickas llamando a la función
    tablero.appendChild(carta); //añadir como hijo al tablero cada carta
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

function verificarPareja() {
  if (cartasGiradas.length !== 2) return;

  const [carta1, carta2] = cartasGiradas; //separar el array en dos variables

  if (carta1.dataset.emoji === carta2.dataset.emoji) {
    sonidoAciertoCarta.play();

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
  if (document.querySelectorAll(".carta.flipped ").length === cartas.length) {
    setTimeout(() => sonidoGanar.play(), 1000);
  }
  cartasGiradas = [];
  firstCard = null;
  secondCard = null;
}
function reiniciarJuego() {
  mensajeGanador.textContent = "";
  mezclarCartas(cartas);
  generarTablero();
}
botonReinicio.addEventListener("click", () => {
  sonidoClick.play();
  reiniciarJuego();
});

mezclarCartas(cartas);
generarTablero();
