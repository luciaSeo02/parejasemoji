"use strict";
// Elementos del DOM 
const contadorIntentos = document.getElementById("intentos");
const tablero = document.getElementById("tableroJuego");
const botonReinicio = document.getElementById("botonReiniciar");
const mensajeGanador = document.getElementById("mensajeGanador");

// Lista de emojis (necesitamos 8 parejas)
const emojis = [
    "🙉","🚀","🌈","🍉","⛔️","🏀","💵","🎁",    
];

// Variables para el juego
let cartas = [...emojis, ...emojis];
let cartasGiradas = [];
let intentos = 0;


// Función para mezclar array 
const mezclarCartas = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};


