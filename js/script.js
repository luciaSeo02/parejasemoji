"use strict";

/* ==============================
    VARIABLES Y ELEMENTOS DEL DOM
   ============================== */

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
const sonidoPerder = new Audio("./audio/lost01.mp3");
const sonidoSelect = new Audio("./audio/click03.mp3");

/* ==============================
    DATOS DEL JUEGO (Emojis y Parejas Opuestas)
   ============================== */

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
  ["🛸", "🌍"],
  ["😇", "😈"],
  ["🌋", "🗻"],
  ["👴", "👶"],
  ["✈", "🚢"],
];

/* ==============================
    VARIABLES GLOBALES
   ============================== */

let cartas = [];
let cartasGiradas = [];
let intentos;
let firstCard = null;
let secondCard = null;
let paresDescubiertos = 0;
let temporizador;
let tiempoRestante = 60;
let modoActual = "clasico";
let tiempoMostrar = 0;
let nombreJugador = "";
let dificultad = "easy";
let ranking = [];
let cartasEmparejadas = [];

/* ==============================
    FUNCIONES PRINCIPALES DEL JUEGO
   ============================== */

// Función para mezclar array
const mezclarCartas = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Calcular el tamaño de la carta segun la pantalla y el numero de cartas
function calcularTamanoCarta(numCartas) {
  let tamanoCarta;

  if (window.innerWidth < 600) {
    // Pantallas pequeñas
    if (numCartas === 24) {
      tamanoCarta = "45px";
    } else if (numCartas === 12) {
      tamanoCarta = "55px";
    } else {
      tamanoCarta = "65px";
    }
  } else if (window.innerWidth < 1000) {
    // Pantallas medianas
    if (numCartas === 24) {
      tamanoCarta = "70px";
    } else if (numCartas === 12) {
      tamanoCarta = "85px";
    } else {
      tamanoCarta = "100px";
    }
  } else {
    // Pantallas grandes
    if (numCartas === 24) {
      tamanoCarta = "80px";
    } else if (numCartas === 12) {
      tamanoCarta = "95px";
    } else {
      tamanoCarta = "110px";
    }
  }
  return tamanoCarta;
}

// Función para actualizar el tamaño de las cartas
function actualizarTamanoCartas() {
  const cartas = document.querySelectorAll(".carta");
  const numCartas = cartas.length;

  const tamanoCarta = calcularTamanoCarta(numCartas); //tamaño de carta actualizado

  cartas.forEach((carta) => {
    carta.style.width = tamanoCarta;
    carta.style.height = tamanoCarta;

    // Añadir clase segun el tamaño de la carta
    if (tamanoCarta <= "65px") {
      carta.classList.add("size-small");
      carta.classList.remove("size-medium", "size-large");
    } else if (tamanoCarta <= "100px") {
      carta.classList.add("size-medium");
      carta.classList.remove("size-small", "size-large");
    } else {
      carta.classList.add("size-large");
      carta.classList.remove("size-small", "size-medium");
    }
  });
}

// Generar el tablero del juego
function generarTablero() {
  tablero.innerHTML = "";

  let dificultad = dificultadSelect.value;

  const modoClaro = document.body.classList.contains("lightMode"); //comprobar que este activo el modo claro

  //definir filas y columnas segun la dificultad
  let filas, columnas, tamanoCarta, numCartas;

  if (dificultad === "easy") {
    filas = 2;
    columnas = 4;
    numCartas = 8;
  } else if (dificultad === "medium") {
    filas = 4;
    columnas = 4;
    numCartas = 16;
  } else if (dificultad === "hard") {
    filas = 6;
    columnas = 4;
    numCartas = 24;
  }

  tamanoCarta = calcularTamanoCarta(numCartas);
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
      backFace.innerHTML =
        '<ion-icon name="help-outline" class="iconoInterrogante"></ion-icon>';

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
  actualizarTamanoCartas();
}

// Girar una carta
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

// Verificar si hay una pareja
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

    carta1.querySelector(".back").innerHTML =
    '<ion-icon name="help-outline" class="iconoInterrogante"></ion-icon>';
    carta2.querySelector(".back").innerHTML =
    '<ion-icon name="help-outline" class="iconoInterrogante"></ion-icon>';

    carta1.classList.remove("flipped");
    carta2.classList.remove("flipped");
  }

  // Comprobar si todas las cartas estan giradas
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

      // Añadi temporizador para ocultar el mensaje después de 5 segundos
      setTimeout(() => {
        mensajeGanador.style.display = "none";
      }, 5000);
    }, 1000);
    clearInterval(temporizador); // Detener el temporizador
  }
  cartasGiradas = [];
  firstCard = null;
  secondCard = null;
}

/* ==============================
    MANEJO DEL RANKING
   ============================== */

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

// Función para guardar el ranking en localStorage
function guardarRanking() {
  localStorage.setItem("ranking", JSON.stringify(ranking)); // Guardar el ranking en localStorage
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

function ajustarTituloRanking() {
  const tituloRanking = document.querySelector(".ranking h2");

  if (window.innerWidth < 600) {
    tituloRanking.textContent = "Ranking Top 5";
    tituloRanking.style.fontSize = "1rem";
  } else {
    tituloRanking.textContent = "Ranking";
    tituloRanking.style.fontSize = "2rem";
  }
}

/* ==============================
    MANEJO DEL JUEGO Y DIFICULTAD
   ============================== */

//para obtener el nombre y no seguir si no lo tiene
function obtenerNombreJugador() {
  const nombre = nombreInput.value.trim().toUpperCase();
  const alertaDiv = document.querySelector(".alertaNombre");

  alertaDiv.innerHTML = "";

  if (!nombre) {
    const mensaje = document.createElement("p");
    mensaje.textContent = "⚠️ Por favor, ingresa tu nombre para comenzar";
    alertaDiv.appendChild(mensaje);
    alertaDiv.style.display = "block";
    return null;
  }

  if (nombre.length > 8) {
    const mensaje = document.createElement("p");
    mensaje.textContent = "⚠️ El nombre no puede superar los 8 caracteres";
    alertaDiv.appendChild(mensaje);
    alertaDiv.style.display = "block";
    return null;
  }

  alertaDiv.style.display = "none";
  return nombre;
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
      sonidoPerder.play();
      mensajeGanador.classList.add("perdedor");
      mensajeGanador.classList.remove("ganador");
      mensajeGanador.style.display = "block";
      tablero.classList.add("noClick");
      // Añadi temporizador para ocultar el mensaje después de 5 segundos
      setTimeout(() => {
        mensajeGanador.style.display = "none";
      }, 5000);
    }
  }, 1000);
}

/* ==============================
    MODO DE JUEGO
   ============================== */

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

/* ==============================
    EVENTOS DEL JUEGO
   ============================== */

// Llamar a cargarRanking al iniciar el juego
cargarRanking();

//para adaptar a las pantallas distintas sin recargar
window.addEventListener("resize", actualizarTamanoCartas);
document.addEventListener("DOMContentLoaded", actualizarTamanoCartas);

//para adaptar el ranking
window.addEventListener("resize", ajustarTituloRanking);
document.addEventListener("DOMContentLoaded", ajustarTituloRanking);

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

// Resetear el ranking
document.getElementById("resetRanking").addEventListener("click", function () {
  document.getElementById("warningMessage").style.display = "flex";
  document.body.classList.add("deshabilitar-interaccion"); //clase para deshabilitar todo el cuerpo hasta que clickes la opcion
  sonidoClick.play();
});

document.getElementById("confirmReset").addEventListener("click", function () {
  localStorage.removeItem("ranking");
  ranking = [];
  mostrarRanking();
  document.getElementById("warningMessage").style.display = "none";
  document.body.classList.remove("deshabilitar-interaccion");
  sonidoSelect.play();
});

document.getElementById("cancelReset").addEventListener("click", function () {
  document.getElementById("warningMessage").style.display = "none";
  document.body.classList.remove("deshabilitar-interaccion");
  sonidoSelect.play();
});

//sonido para seleccion dificultad
document.getElementById("dificultad").addEventListener("change", function () {
  sonidoSelect.currentTime = 0; // Reinicia el sonido
  sonidoSelect.play();
});

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

// TEMA DE LA WEB
// Cambiar el tema al interactuar con el switch
toggleModoOscuro.addEventListener("change", () => {
  document.body.classList.toggle("lightMode");

  //guardar en un local storage
  if (document.body.classList.contains("lightMode")) {
    localStorage.setItem("theme", "lightMode");
  } else {
    localStorage.setItem("theme", "darkMode");
  }
});

//verifica que tema tendra al cargar la pagina
document.addEventListener("DOMContentLoaded", () => {
  const storedTheme = localStorage.getItem("theme");

  if (storedTheme === "lightMode") {
    document.body.classList.add("lightMode");
    toggleModoOscuro.checked = true;
  } else {
    toggleModoOscuro.checked = false;
  }
});
