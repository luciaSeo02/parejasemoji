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

const toggleModoOscuro = document.getElementById("modoOscuroSwitch");

// Sonidos
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
let intentos;
let firstCard = null;
let secondCard = null;
let paresDescubiertos = 0;
let temporizador; // Variable para almacenar el temporizador
let tiempoRestante = 60; // 60 segundos de tiempo para el juego
let modoActual = "clasico"; //marcar el modo de juego
let tiempoMostrar = 0;
let nombreJugador = "";
let dificultad = "easy";
// Variables para el ranking
let ranking = [];

let cartasEmparejadas = [];

// Función para cargar el ranking desde localStorage
function cargarRanking() {
  const rankingGuardado = localStorage.getItem("ranking");
  ranking = rankingGuardado ? JSON.parse(rankingGuardado) : []; // Cargar el ranking desde localStorage
}

// Función para agregar un nuevo puntaje al ranking
function agregarPuntaje(nombre, intentos) {
  const modo = modoActual;
  const dificultad = dificultadSelect.value;

  nombre = nombre.toUpperCase();

  //buscar si ya tiene un registro en el mismo modo y dificultad
  const jugadorExistente = ranking.find(
    (jugador) =>
      jugador.nombre === nombre &&
      jugador.modo === modo &&
      jugador.dificultad === dificultad
  );

  if (jugadorExistente) {
    if (intentos < jugadorExistente.intentos) {
      jugadorExistente.intentos = intentos; // Actualizar el intento
    }
  } else {
    ranking.push({ nombre, intentos, modo, dificultad }); // Agregar nuevo jugador
  }

  ranking.sort((a, b) => a.intentos - b.intentos); // Ordenar por intentos

  guardarRanking(); // Guardar el ranking después de agregar un nuevo puntaje
}

// Función para mostrar el ranking
function mostrarRanking() {
  const rankingList = document.getElementById("rankingList");
  rankingList.innerHTML = ""; // Limpiar la lista antes de mostrar

  // Filtrar el ranking para mostrar solo los puntajes del modo y dificultad actuales
  const rankingFiltrado = ranking.filter(
    (jugador) =>
      jugador.modo === modoActual &&
      jugador.dificultad === dificultadSelect.value
  );

  // Ordenar por intentos (menor es mejor)
  rankingFiltrado.sort((a, b) => a.intentos - b.intentos);

  // Limitar a los primeros 5 jugadores
  const top5Ranking = rankingFiltrado.slice(0, 5);

  top5Ranking.forEach((jugador) => {
    const li = document.createElement("li");
    li.textContent = `${jugador.nombre}: ${jugador.intentos} intentos`;
    rankingList.appendChild(li);
  });
}

// Función para guardar el ranking en localStorage
function guardarRanking() {
  localStorage.setItem("ranking", JSON.stringify(ranking)); // Guardar el ranking en localStorage
}

// Llamar a cargarRanking al iniciar el juego
cargarRanking();

// Función para mezclar array
const mezclarCartas = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

function generarTablero() {
  tablero.innerHTML = "";

  let dificultad = dificultadSelect.value;

  const modoClaro = document.body.classList.contains("lightMode"); //comprobar que este activo el modo claro

  //definir filas y columnas segun la dificultad
  let filas, columnas, tamanoCarta;

  if (dificultad === "easy") {
    filas = 2;
    columnas = 4;
    tamanoCarta = calcularTamanoCarta();
  } else if (dificultad === "medium") {
    filas = 4;
    columnas = 4;
    tamanoCarta = calcularTamanoCarta();
  } else if (dificultad === "hard") {
    filas = 6;
    columnas = 4;
    tamanoCarta = calcularTamanoCarta();
  }

  tablero.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;

  for (let i = 0; i < filas * columnas; i++) {
    if (i < cartas.length) {
      const carta = document.createElement("div");
      carta.classList.add("carta");

      if (modoClaro) {
        carta.classList.add("lightMode");
      }

      carta.style.width = tamanoCarta;
      carta.style.height = tamanoCarta;
      carta.dataset.emoji = cartas[i];

      if (cartasEmparejadas.includes(i)) {
        carta.classList.add("flipped");
        const frontFace = carta.querySelector(".front");
        frontFace.textContent = carta.dataset.emoji;
      }

      const frontFace = document.createElement("div");
      frontFace.classList.add("cara", "front");
      frontFace.textContent = "";

      const backFace = document.createElement("div");
      backFace.classList.add("cara", "back");
      backFace.textContent = "❔";

      carta.appendChild(frontFace);
      carta.appendChild(backFace);

      carta.addEventListener("click", handleCardClick);
      tablero.appendChild(carta);
    }
  }
  // Reiniciar variables
  firstCard = null;
  secondCard = null;
  cartasGiradas = [];
  intentos = 0;
  contadorIntentos.textContent = intentos;
}

// Función para actualizar el tamaño de las cartas
function actualizarTamanoCartas() {
  const cartas = document.querySelectorAll(".carta");
  const tamanoCarta = calcularTamanoCarta(); //tamaño de carta actualizado

  cartas.forEach((carta) => {
    carta.style.width = tamanoCarta;
    carta.style.height = tamanoCarta;
  });
}

function calcularTamanoCarta() {
  let tamanoCarta;
  if (window.innerWidth < 600) {
    tamanoCarta = "60px"; //pantallas peque
  } else if (window.innerWidth < 1000) {
    tamanoCarta = "80px"; //pantallas medianas
  } else {
    tamanoCarta = "100px"; //pantallas grandes
  }
  return tamanoCarta;
}

//para adaptar a las pantallas distintas sin recargar
window.addEventListener("resize", () => {
  actualizarTamanoCartas();
});

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
  if (document.querySelectorAll(".carta.flipped").length === cartas.length) {
    setTimeout(() => {
      sonidoGanar.play();
      let mensaje = `¡Felicidades, ${nombreInput.value}! Has completado el juego en ${intentos} intentos.`;
      mensajeGanador.textContent = mensaje;
      mensajeGanador.classList.add("ganador");
      mensajeGanador.classList.remove("perdedor");
      mensajeGanador.style.display = "block";
      agregarPuntaje(nombreInput.value, intentos); // Agregar puntaje al ranking
      mostrarRanking();
    }, 1000);
    clearInterval(temporizador); // Detener el temporizador
  }
  cartasGiradas = [];
  firstCard = null;
  secondCard = null;
}

// Función para iniciar el juego
function iniciarJuego() {
  tiempoRestante = 60;
  contadorIntentos.textContent = 0;
  mensajeGanador.textContent = "";
  const dificultad = dificultadSelect.value;
  establecerDificultad(dificultad);
  mostrarRanking();
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
  clearInterval(temporizador);
  const nombre = obtenerNombreJugador(); //obtenemos el nombre del jugador
  if (!nombre) return; //si no tiene nombre no continúa
  iniciarJuego();
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
  const nombre = nombreInput.value.trim().toUpperCase();
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
  mensajeGanador.classList.remove("ganador", "perdedor");
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
  nombreJugador = nombre.toUpperCase(); //guarda nombre mayusculas
  pantallaInicio.style.display = "none";
  containerJuego.style.display = "flex";
  tablero.classList.add("noClick");
  modoActual = modo;
  iniciarJuego();
}

//seleccionar el modo de juego
btnClasico.addEventListener("click", () => {
  iniciarJuegoModo("clasico");
  sonidoClick.play();
});
btnInverso.addEventListener("click", () => {
  sonidoClick.play();
  iniciarJuegoModo("inverso");
});

btnAtras.addEventListener("click", () => {
  sonidoClick.play();
  volverPantallaAtras();
});

//TEMA DE LA WEB
toggleModoOscuro.addEventListener("change", () => {
  document.body.classList.toggle("lightMode");
  document.querySelector(".info").classList.toggle("lightMode");
  document.querySelector(".container").classList.toggle("lightMode");
  document.querySelector(".contenedorJuego").classList.toggle("lightMode");
  document.querySelector(".ranking").classList.toggle("lightMode");
  document.querySelector(".pantalla-inicio").classList.toggle("lightMode");
  mensajeGanador.classList.toggle("lightMode");
  dificultadSelect.classList.toggle("lightMode");
  const cartasEnTablero = tablero.querySelectorAll(".carta");
  cartasEnTablero.forEach((carta) => {
    carta.classList.toggle("lightMode");
  });
});