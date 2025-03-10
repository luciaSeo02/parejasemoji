"use strict";

//Traer elementos de HTML
const tablero = document.getElementById("tableroJuego");
const contadorIntentos = document.getElementById("intentos");
const botonReinicio = document.getElementById("botonReiniciar");
const mensajeGanador = document.getElementById("mensajeGanador");

//Declaración variables
const emojis = ["🙉", "🚀", "🌈", "🍉", "⛔️", "🏀", "💵", "🎁"];

let cartas = [...emojis, ...emojis];
let cartasGiradas = [];
let intentos = 0;
let firstCard = null;
let secondCard = null;
let matchedPairs = 0;

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
    carta.addEventListener("click", girarCarta); //girar la carta cuando clickas llamando a la función
    tablero.appendChild(carta); //añadir como hijo al tablero cada carta
  });
}

// Función para voltear la carta
function flipCard(carta) {
  if (carta.classList.contains("flipped")) return;
  carta.classList.add("flipped"); // Esto activa el giro
}

// Función que se ejecuta cuando se hace clic en una carta
function handleCardClick(event) {
  const clickedCard = event.target.closest(".carta"); // Seleccionamos la carta completa.

  if (clickedCard.classList.contains("flipped")) return; // Si la carta ya está volteada, no hacer nada.

  flipCard(clickedCard);

  if (!firstCard) {
    firstCard = clickedCard;
  } else {
    secondCard = clickedCard;
    intentos++;
    contadorIntentos.textContent = intentos;

  }
}

mezclarCartas(cartas);
generarTablero();
