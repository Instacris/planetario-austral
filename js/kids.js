/* ============================================================
   PLANETARIO AUSTRAL — js/kids.js
   Zona infantil:
     1. Marcador de estrellas ganadas (persistente en localStorage)
     2. Súper Quiz Espacial con feedback inmediato animado
     3. Juego de colorear (canvas doble: pintura + líneas encima)
     4. Juego "¡Encuéntralo!" de selección de imágenes
   Datos de las preguntas verificados con NASA / NASA Space Place.
   ============================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     1. MARCADOR DE ESTRELLAS
     ------------------------------------------------------------ */
  const CLAVE_ESTRELLAS = "planetario_estrellas";
  const marcadorTexto = document.getElementById("kids-estrellas");
  const marcador = document.querySelector(".kids__marcador");

  let estrellas = 0;
  try {
    estrellas = parseInt(localStorage.getItem(CLAVE_ESTRELLAS), 10) || 0;
  } catch (e) {
    /* localStorage puede no estar disponible; se juega sin persistencia */
  }
  marcadorTexto.textContent = estrellas;

  function ganarEstrella() {
    estrellas += 1;
    marcadorTexto.textContent = estrellas;
    try {
      localStorage.setItem(CLAVE_ESTRELLAS, String(estrellas));
    } catch (e) { /* sin persistencia, no pasa nada */ }

    // Pequeña animación de celebración en el marcador
    marcador.classList.remove("brilla");
    void marcador.offsetWidth; // reinicia la animación CSS
    marcador.classList.add("brilla");
  }

  /* ------------------------------------------------------------
     2. SÚPER QUIZ ESPACIAL
     Preguntas basadas en datos de NASA / NASA Space Place.
     ------------------------------------------------------------ */
  const PREGUNTAS = [
    {
      pregunta: "¿En qué planeta vives?",
      opciones: ["Marte", "La Tierra", "Júpiter", "Venus"],
      correcta: 1,
      dato: "¡Sí! La Tierra es el tercer planeta desde el Sol y nuestro único hogar.",
    },
    {
      pregunta: "¿Cuál es el planeta más pequeño?",
      opciones: ["Mercurio", "Marte", "La Tierra", "Neptuno"],
      correcta: 0,
      dato: "Mercurio es el más pequeñito de los 8 planetas.",
    },
    {
      pregunta: "¿Cuál es el planeta más cercano al Sol?",
      opciones: ["Venus", "La Tierra", "Mercurio", "Saturno"],
      correcta: 2,
      dato: "Mercurio está tan cerca que su año dura solo 88 días.",
    },
    {
      pregunta: "¿Cuál es el planeta más grande?",
      opciones: ["Saturno", "Júpiter", "Urano", "La Tierra"],
      correcta: 1,
      dato: "¡Júpiter es gigante! Es el planeta más grande de todos.",
    },
    {
      pregunta: "¿Cuál es el planeta más caliente?",
      opciones: ["Mercurio", "Marte", "Júpiter", "Venus"],
      correcta: 3,
      dato: "Aunque Mercurio está más cerca del Sol, ¡Venus es el más caliente!",
    },
    {
      pregunta: "¿Qué planeta tiene anillos famosos?",
      opciones: ["Saturno", "Marte", "Venus", "Mercurio"],
      correcta: 0,
      dato: "Los anillos de Saturno lo hacen único y hermoso.",
    },
    {
      pregunta: "¿Cuál es el planeta más frío?",
      opciones: ["Urano", "Neptuno", "Marte", "Saturno"],
      correcta: 1,
      dato: "Neptuno es el más frío: ¡es el que está más lejos del Sol!",
    },
    {
      pregunta: "¿Qué planeta gira acostado, de lado?",
      opciones: ["La Tierra", "Júpiter", "Urano", "Venus"],
      correcta: 2,
      dato: "¡Urano rueda de lado mientras gira alrededor del Sol!",
    },
    {
      pregunta: "¿Cuántas lunas tiene la Tierra?",
      opciones: ["Ninguna", "Una", "Dos", "Diez"],
      correcta: 1,
      dato: "Tenemos una sola Luna, ¡pero otros planetas tienen docenas!",
    },
    {
      pregunta: "¿Qué es el Sol?",
      opciones: ["Un planeta", "Un cometa", "Una galaxia", "Una estrella"],
      correcta: 3,
      dato: "El Sol es una estrella de gas muy caliente. ¡Nuestra estrella!",
    },
  ];

  const quizProgreso = document.getElementById("quiz-progreso");
  const quizPregunta = document.getElementById("quiz-pregunta");
  const quizOpciones = document.getElementById("quiz-opciones");
  const quizFeedback = document.getElementById("quiz-feedback");
  const quizSiguiente = document.getElementById("quiz-siguiente");

  let preguntaActual = 0;
  let aciertos = 0;

  function mostrarPregunta() {
    const q = PREGUNTAS[preguntaActual];
    quizProgreso.textContent = "Pregunta " + (preguntaActual + 1) + " de " + PREGUNTAS.length;
    quizPregunta.textContent = q.pregunta;
    quizFeedback.textContent = "";
    quizFeedback.className = "quiz__feedback";
    quizSiguiente.hidden = true;
    quizOpciones.innerHTML = "";

    q.opciones.forEach((texto, i) => {
      const boton = document.createElement("button");
      boton.className = "quiz__opcion";
      boton.type = "button";
      boton.textContent = texto;
      boton.addEventListener("click", () => responder(boton, i));
      quizOpciones.appendChild(boton);
    });
  }

  function responder(boton, indice) {
    const q = PREGUNTAS[preguntaActual];

    if (indice === q.correcta) {
      // Acierto: se ilumina en verde, rebota y suma estrella
      boton.classList.add("es-correcta");
      quizFeedback.textContent = "¡Correcto! 🎉 " + q.dato;
      quizFeedback.classList.add("ok");
      ganarEstrella();
      aciertos += 1;
      // Bloquear todas las opciones y ofrecer la siguiente pregunta
      quizOpciones.querySelectorAll("button").forEach((b) => (b.disabled = true));
      quizSiguiente.hidden = false;
      quizSiguiente.focus();
    } else {
      // Error: tiembla en rojo, pero se puede volver a intentar
      boton.classList.add("es-incorrecta");
      boton.disabled = true;
      quizFeedback.textContent = "¡Casi! Inténtalo otra vez 💪";
      quizFeedback.classList.add("mal");
      setTimeout(() => {
        quizFeedback.classList.remove("mal");
      }, 1200);
    }
  }

  quizSiguiente.addEventListener("click", () => {
    preguntaActual += 1;
    if (preguntaActual < PREGUNTAS.length) {
      mostrarPregunta();
    } else {
      // Fin del quiz: resumen y opción de volver a jugar
      quizProgreso.textContent = "¡Quiz terminado!";
      quizPregunta.textContent =
        "🏆 ¡Lo lograste! Acertaste " + aciertos + " de " + PREGUNTAS.length + " preguntas.";
      quizOpciones.innerHTML = "";
      quizFeedback.textContent = "";
      quizSiguiente.textContent = "Jugar de nuevo 🔄";
      quizSiguiente.hidden = false;
      quizSiguiente.onclick = () => {
        preguntaActual = 0;
        aciertos = 0;
        quizSiguiente.textContent = "Siguiente pregunta →";
        quizSiguiente.onclick = null;
        mostrarPregunta();
      };
    }
  });

  mostrarPregunta();

  /* ------------------------------------------------------------
     3. JUEGO DE COLOREAR
     Dos lienzos apilados: en el de abajo se pinta libremente y el
     de arriba muestra el dibujo de líneas (cohete + planeta) que
     nunca se borra.
     ------------------------------------------------------------ */
  const lienzoPintura = document.getElementById("colorear-pintura");
  const lienzoLineas = document.getElementById("colorear-lineas");
  const paleta = document.getElementById("colorear-paleta");
  const controlTamano = document.getElementById("colorear-tamano");
  const btnBorrador = document.getElementById("colorear-borrador");
  const btnLimpiar = document.getElementById("colorear-limpiar");

  const pinturaCtx = lienzoPintura.getContext("2d");
  const lineasCtx = lienzoLineas.getContext("2d");

  const COLORES = [
    "#ff4d4d", "#ff8c42", "#ffd93d", "#3cb371", "#4d96ff",
    "#9b6bff", "#ff6bd6", "#8b5a2b", "#111827", "#9ca3af",
    "#7fdbff", "#ffffff",
  ];

  let colorActual = COLORES[0];
  let usandoBorrador = false;
  let pintando = false;
  let primeraPincelada = true;

  // Construir la paleta de colores seleccionable
  COLORES.forEach((color, i) => {
    const boton = document.createElement("button");
    boton.className = "colorear__color" + (i === 0 ? " is-activo" : "");
    boton.type = "button";
    boton.style.background = color;
    boton.setAttribute("aria-label", "Color " + color);
    boton.addEventListener("click", () => {
      colorActual = color;
      usandoBorrador = false;
      btnBorrador.classList.remove("is-activo");
      paleta.querySelectorAll("button").forEach((b) => b.classList.remove("is-activo"));
      boton.classList.add("is-activo");
    });
    paleta.appendChild(boton);
  });

  btnBorrador.addEventListener("click", () => {
    usandoBorrador = !usandoBorrador;
    btnBorrador.classList.toggle("is-activo", usandoBorrador);
  });

  btnLimpiar.addEventListener("click", prepararLienzo);

  // Fondo blanco del lienzo de pintura
  function prepararLienzo() {
    pinturaCtx.fillStyle = "#ffffff";
    pinturaCtx.fillRect(0, 0, lienzoPintura.width, lienzoPintura.height);
  }

  // Dibujo de líneas: cohete despegando + planeta con anillos + estrellas
  function dibujarLineas() {
    const c = lineasCtx;
    c.clearRect(0, 0, 640, 440);
    c.strokeStyle = "#1f2a44";
    c.lineWidth = 5;
    c.lineJoin = "round";
    c.lineCap = "round";

    // --- Cohete ---
    c.beginPath(); // cuerpo con punta redondeada
    c.moveTo(200, 55);
    c.quadraticCurveTo(248, 120, 248, 205);
    c.lineTo(248, 295);
    c.lineTo(152, 295);
    c.lineTo(152, 205);
    c.quadraticCurveTo(152, 120, 200, 55);
    c.closePath();
    c.stroke();

    c.beginPath(); // ventana (dos círculos)
    c.arc(200, 175, 26, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(200, 175, 15, 0, Math.PI * 2);
    c.stroke();

    c.beginPath(); // aleta izquierda
    c.moveTo(152, 230);
    c.lineTo(108, 305);
    c.lineTo(152, 295);
    c.closePath();
    c.stroke();

    c.beginPath(); // aleta derecha
    c.moveTo(248, 230);
    c.lineTo(292, 305);
    c.lineTo(248, 295);
    c.closePath();
    c.stroke();

    c.beginPath(); // llama del motor
    c.moveTo(170, 295);
    c.quadraticCurveTo(178, 340, 200, 375);
    c.quadraticCurveTo(222, 340, 230, 295);
    c.stroke();

    // --- Planeta con anillo ---
    c.beginPath();
    c.arc(480, 170, 72, 0, Math.PI * 2);
    c.stroke();
    c.beginPath(); // anillo
    c.ellipse(480, 170, 115, 30, -0.35, 0, Math.PI * 2);
    c.stroke();
    c.beginPath(); // cráteres
    c.arc(455, 145, 12, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(505, 195, 9, 0, Math.PI * 2);
    c.stroke();

    // --- Luna creciente ---
    c.beginPath();
    c.arc(505, 370, 34, 0.6, Math.PI * 2 - 0.6, false);
    c.quadraticCurveTo(510, 370, 525, 348);
    c.stroke();

    // --- Estrellitas de 4 puntas ---
    const estrellita = (x, y, r) => {
      c.beginPath();
      c.moveTo(x, y - r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.quadraticCurveTo(x, y, x, y + r);
      c.quadraticCurveTo(x, y, x - r, y);
      c.quadraticCurveTo(x, y, x, y - r);
      c.closePath();
      c.stroke();
    };
    estrellita(80, 90, 16);
    estrellita(580, 60, 13);
    estrellita(70, 370, 13);
    estrellita(340, 45, 10);
  }

  // Convierte coordenadas del puntero a coordenadas internas del canvas
  function puntoEnLienzo(ev) {
    const rect = lienzoPintura.getBoundingClientRect();
    return {
      x: ((ev.clientX - rect.left) / rect.width) * lienzoPintura.width,
      y: ((ev.clientY - rect.top) / rect.height) * lienzoPintura.height,
    };
  }

  function trazar(ev) {
    if (!pintando) return;
    const p = puntoEnLienzo(ev);
    pinturaCtx.lineTo(p.x, p.y);
    pinturaCtx.strokeStyle = usandoBorrador ? "#ffffff" : colorActual;
    pinturaCtx.lineWidth = Number(controlTamano.value);
    pinturaCtx.lineCap = "round";
    pinturaCtx.lineJoin = "round";
    pinturaCtx.stroke();
  }

  // Eventos de puntero: funcionan con mouse, dedo y lápiz
  lienzoPintura.addEventListener("pointerdown", (ev) => {
    pintando = true;
    lienzoPintura.setPointerCapture(ev.pointerId);
    const p = puntoEnLienzo(ev);
    pinturaCtx.beginPath();
    pinturaCtx.moveTo(p.x, p.y);
    trazarPunto(p); // pinta aunque sea un solo toque
    if (primeraPincelada) {
      primeraPincelada = false;
      ganarEstrella(); // ⭐ premio por animarse a pintar
    }
  });

  function trazarPunto(p) {
    pinturaCtx.fillStyle = usandoBorrador ? "#ffffff" : colorActual;
    pinturaCtx.beginPath();
    pinturaCtx.arc(p.x, p.y, Number(controlTamano.value) / 2, 0, Math.PI * 2);
    pinturaCtx.fill();
    pinturaCtx.beginPath();
    pinturaCtx.moveTo(p.x, p.y);
  }

  lienzoPintura.addEventListener("pointermove", trazar);
  ["pointerup", "pointercancel", "pointerleave"].forEach((tipo) =>
    lienzoPintura.addEventListener(tipo, () => (pintando = false))
  );

  prepararLienzo();
  dibujarLineas();

  /* ------------------------------------------------------------
     4. JUEGO "¡ENCUÉNTRALO!"
     Las tarjetas (con imágenes que pondrá el equipo del planetario)
     llevan data-objeto; cada ronda pide encontrar un objeto distinto.
     ------------------------------------------------------------ */
  const RONDAS = [
    { objetivo: "cometa", pregunta: "¿Cuál de estas imágenes es un cometa? ☄️" },
    { objetivo: "planeta", pregunta: "¿Y ahora… cuál es un planeta? 🪐" },
    { objetivo: "estrella", pregunta: "¿Cuál de estas es una estrella? ⭐" },
    { objetivo: "galaxia", pregunta: "Última: ¿cuál es una galaxia? 🌌" },
  ];

  const NOMBRES = {
    cometa: "un cometa",
    planeta: "un planeta",
    estrella: "una estrella",
    galaxia: "una galaxia",
  };

  const encuentraPregunta = document.getElementById("encuentra-pregunta");
  const encuentraFeedback = document.getElementById("encuentra-feedback");
  const cartas = Array.from(document.querySelectorAll(".encuentra__carta"));

  let rondaActual = 0;
  let bloqueado = false; // evita clics durante la animación de acierto

  function mostrarRonda() {
    encuentraPregunta.textContent = RONDAS[rondaActual].pregunta;
    encuentraFeedback.textContent = "";
    encuentraFeedback.className = "quiz__feedback";
    cartas.forEach((c) => c.classList.remove("es-correcta", "es-incorrecta"));
  }

  cartas.forEach((carta) =>
    carta.addEventListener("click", () => {
      if (bloqueado) return;
      const objetivo = RONDAS[rondaActual].objetivo;
      const elegido = carta.dataset.objeto;

      if (elegido === objetivo) {
        carta.classList.add("es-correcta");
        encuentraFeedback.textContent = "¡Muy bien! 🎉 Eso es " + NOMBRES[objetivo] + ".";
        encuentraFeedback.classList.add("ok");
        ganarEstrella();
        bloqueado = true;
        // Pasar a la siguiente ronda (vuelve a empezar al terminar)
        setTimeout(() => {
          rondaActual = (rondaActual + 1) % RONDAS.length;
          bloqueado = false;
          mostrarRonda();
        }, 1600);
      } else {
        carta.classList.add("es-incorrecta");
        encuentraFeedback.textContent =
          "Ups, eso es " + NOMBRES[elegido] + ". ¡Busca " + NOMBRES[objetivo] + "!";
        encuentraFeedback.classList.add("mal");
        setTimeout(() => carta.classList.remove("es-incorrecta"), 600);
      }
    })
  );

  mostrarRonda();
})();
