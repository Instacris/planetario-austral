/* ============================================================
   PLANETARIO AUSTRAL — js/contacto.js
   Agendamiento de visitas:
     1. Calendario visual construido a mano (sin librerías)
        · No permite fechas pasadas
        · Los lunes aparecen deshabilitados (el planetario cierra)
     2. Selector de horarios
     3. Resumen dinámico + validación del formulario
   Todo funciona en frontend; el envío real queda preparado para
   conectarse a un backend (ver comentario TODO en enviar()).
   ============================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     Referencias del DOM
     ------------------------------------------------------------ */
  const mesEtiqueta = document.getElementById("cal-mes");
  const grid = document.getElementById("cal-grid");
  const btnPrev = document.getElementById("cal-prev");
  const btnNext = document.getElementById("cal-next");
  const contenedorHoras = document.getElementById("agenda-horas");
  const resumen = document.getElementById("agenda-resumen");
  const formulario = document.getElementById("agenda-form");
  const mensajeOk = document.getElementById("agenda-ok");

  const inputNombre = document.getElementById("agenda-nombre");
  const inputEmail = document.getElementById("agenda-email");
  const inputPersonas = document.getElementById("agenda-personas");

  /* ------------------------------------------------------------
     Estado de la reserva
     ------------------------------------------------------------ */
  const HORARIOS = ["10:00", "11:30", "13:00", "15:00", "16:30", "18:00"];

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let mesMostrado = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  let fechaSeleccionada = null; // Date
  let horaSeleccionada = null;  // "16:30"

  /* ------------------------------------------------------------
     1. CALENDARIO
     ------------------------------------------------------------ */
  function renderCalendario() {
    grid.innerHTML = "";

    // Título del mes, p. ej. "julio de 2026"
    mesEtiqueta.textContent = mesMostrado.toLocaleDateString("es", {
      month: "long",
      year: "numeric",
    });

    // No se puede navegar a meses anteriores al actual
    const esMesActual =
      mesMostrado.getFullYear() === hoy.getFullYear() &&
      mesMostrado.getMonth() === hoy.getMonth();
    btnPrev.disabled = esMesActual;

    const anio = mesMostrado.getFullYear();
    const mes = mesMostrado.getMonth();
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();

    // Semana que empieza en lunes: getDay() da 0=domingo … 6=sábado
    const desplazamiento = (new Date(anio, mes, 1).getDay() + 6) % 7;

    // Celdas vacías hasta el primer día del mes
    for (let i = 0; i < desplazamiento; i++) {
      const vacio = document.createElement("span");
      vacio.className = "calendario__vacio";
      grid.appendChild(vacio);
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = new Date(anio, mes, dia);
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "calendario__dia";
      boton.textContent = dia;

      const esPasado = fecha < hoy;
      const esLunes = fecha.getDay() === 1; // el planetario cierra los lunes
      boton.disabled = esPasado || esLunes;

      if (fecha.getTime() === hoy.getTime()) boton.classList.add("es-hoy");
      if (fechaSeleccionada && fecha.getTime() === fechaSeleccionada.getTime()) {
        boton.classList.add("is-seleccionado");
      }

      const etiqueta = fecha.toLocaleDateString("es", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      boton.setAttribute(
        "aria-label",
        boton.disabled ? etiqueta + " (no disponible)" : "Reservar el " + etiqueta
      );

      boton.addEventListener("click", () => {
        fechaSeleccionada = fecha;
        renderCalendario();
        actualizarResumen();
      });

      grid.appendChild(boton);
    }
  }

  btnPrev.addEventListener("click", () => {
    mesMostrado = new Date(mesMostrado.getFullYear(), mesMostrado.getMonth() - 1, 1);
    renderCalendario();
  });

  btnNext.addEventListener("click", () => {
    mesMostrado = new Date(mesMostrado.getFullYear(), mesMostrado.getMonth() + 1, 1);
    renderCalendario();
  });

  /* ------------------------------------------------------------
     2. HORARIOS
     ------------------------------------------------------------ */
  HORARIOS.forEach((hora) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "agenda__hora";
    boton.textContent = hora;
    boton.addEventListener("click", () => {
      horaSeleccionada = hora;
      contenedorHoras
        .querySelectorAll("button")
        .forEach((b) => b.classList.toggle("is-seleccionado", b === boton));
      actualizarResumen();
    });
    contenedorHoras.appendChild(boton);
  });

  /* ------------------------------------------------------------
     3. RESUMEN + VALIDACIÓN + ENVÍO
     ------------------------------------------------------------ */
  function actualizarResumen() {
    if (!fechaSeleccionada && !horaSeleccionada) {
      resumen.textContent = "Selecciona un día y una hora para ver el resumen de tu reserva.";
      return;
    }

    const partes = [];
    if (fechaSeleccionada) {
      partes.push(
        "<strong>" +
          fechaSeleccionada.toLocaleDateString("es", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }) +
          "</strong>"
      );
    }
    if (horaSeleccionada) partes.push("a las <strong>" + horaSeleccionada + "</strong>");

    const personas = inputPersonas.value || "1";
    resumen.innerHTML =
      "🎟️ Tu visita: " + partes.join(" ") + " · " + personas +
      (personas === "1" ? " visitante" : " visitantes") +
      (fechaSeleccionada && horaSeleccionada ? ". ¡Solo falta confirmar!" : ".");
  }

  inputPersonas.addEventListener("input", actualizarResumen);

  const emailValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

  formulario.addEventListener("submit", (ev) => {
    ev.preventDefault();
    mensajeOk.hidden = true;

    // --- Validación básica en frontend ---
    const errores = [];

    inputNombre.classList.toggle("es-invalido", !inputNombre.value.trim());
    if (!inputNombre.value.trim()) errores.push("tu nombre");

    inputEmail.classList.toggle("es-invalido", !emailValido(inputEmail.value));
    if (!emailValido(inputEmail.value)) errores.push("un correo válido");

    if (!fechaSeleccionada) errores.push("el día de tu visita");
    if (!horaSeleccionada) errores.push("la hora");

    if (errores.length > 0) {
      mensajeOk.hidden = false;
      mensajeOk.classList.add("es-error");
      mensajeOk.textContent = "Nos falta: " + errores.join(", ") + ".";
      return;
    }

    // --- Reserva lista: aquí se conectaría el backend ---
    const reserva = {
      nombre: inputNombre.value.trim(),
      email: inputEmail.value.trim(),
      telefono: document.getElementById("agenda-telefono").value.trim(),
      personas: Number(inputPersonas.value),
      // Se formatea a mano (AAAA-MM-DD) para no sufrir el desfase
      // de zona horaria que produce toISOString()
      fecha:
        fechaSeleccionada.getFullYear() + "-" +
        String(fechaSeleccionada.getMonth() + 1).padStart(2, "0") + "-" +
        String(fechaSeleccionada.getDate()).padStart(2, "0"),
      hora: horaSeleccionada,
    };

    // TODO (backend): enviar la reserva al servidor, por ejemplo:
    // fetch("/api/reservas", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(reserva),
    // }).then(...);
    console.log("Reserva lista para enviar al backend:", reserva);

    mensajeOk.hidden = false;
    mensajeOk.classList.remove("es-error");
    mensajeOk.textContent =
      "✨ ¡Reserva registrada, " + reserva.nombre.split(" ")[0] + "! Te esperamos el " +
      fechaSeleccionada.toLocaleDateString("es", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }) +
      " a las " + reserva.hora + ". Te enviaremos la confirmación a " + reserva.email + ".";

    formulario.reset();
    inputPersonas.value = "2";
    fechaSeleccionada = null;
    horaSeleccionada = null;
    contenedorHoras.querySelectorAll("button").forEach((b) => b.classList.remove("is-seleccionado"));
    renderCalendario();
    actualizarResumen();
    resumen.textContent = "Selecciona un día y una hora para ver el resumen de tu reserva.";
  });

  /* ------------------------------------------------------------
     Arranque
     ------------------------------------------------------------ */
  renderCalendario();
})();
