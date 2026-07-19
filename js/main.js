/* ============================================================
   PLANETARIO AUSTRAL — js/main.js
   Lógica general del sitio:
     1. Navegación (menú móvil + enlace activo al hacer scroll)
     2. Modal de fichas de objetos (compartido con el universo)
     3. Buscador con filtros y chips de búsquedas famosas
     4. Galería automática (4 segundos exactos por imagen)
     5. Animaciones de aparición al hacer scroll
     6. Pestañas de la sección Educativo
   ============================================================ */

(function () {
  "use strict";

  /* Con JS presente se habilitan los estados ocultos de .reveal (sin JS, todo visible) */
  document.documentElement.classList.add("js");

  const DATOS = window.PLANETARIO_DATA || [];

  /* ------------------------------------------------------------
     1. NAVEGACIÓN
     ------------------------------------------------------------ */
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = Array.from(document.querySelectorAll(".nav__link"));

  navToggle.addEventListener("click", () => {
    const abierto = navMenu.classList.toggle("is-abierto");
    navToggle.setAttribute("aria-expanded", String(abierto));
    navToggle.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
  });

  // Cerrar el menú móvil al elegir una sección
  navLinks.forEach((enlace) =>
    enlace.addEventListener("click", () => {
      navMenu.classList.remove("is-abierto");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  // Resaltar en el header la sección actualmente visible
  const secciones = ["inicio", "educativo", "kids", "contacto"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const observadorNav = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          navLinks.forEach((enlace) => {
            const activo = enlace.getAttribute("href") === "#" + entrada.target.id;
            enlace.classList.toggle("is-active", activo);
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    secciones.forEach((s) => observadorNav.observe(s));
  }

  /* ------------------------------------------------------------
     2. MODAL DE FICHAS
     Expuesto en window.PlanetarioUI para que lo usen el universo
     interactivo y el buscador.
     ------------------------------------------------------------ */
  const modal = document.getElementById("modal-objeto");
  const modalIcono = document.getElementById("modal-icono");
  const modalTipo = document.getElementById("modal-tipo");
  const modalTitulo = document.getElementById("modal-titulo");
  const modalResumen = document.getElementById("modal-resumen");
  const modalFuente = document.getElementById("modal-fuente");
  let ultimoFoco = null; // para devolver el foco al cerrar (accesibilidad)

  function abrirModal(id) {
    const info = DATOS.find((d) => d.id === id);
    if (!info) return;

    modalIcono.textContent = info.icono;
    modalTipo.textContent = info.tipo;
    modalTitulo.textContent = info.nombre;
    modalResumen.textContent = info.resumen;
    modalFuente.textContent = "Fuente: " + info.fuente;

    ultimoFoco = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden"; // evita scroll de fondo
    modal.querySelector(".modal__cerrar").focus();
  }

  function cerrarModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (ultimoFoco) ultimoFoco.focus();
  }

  // Cerrar con los botones marcados, con clic en el fondo o con Escape
  modal.querySelectorAll("[data-cerrar-modal]").forEach((el) =>
    el.addEventListener("click", cerrarModal)
  );
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && !modal.hidden) cerrarModal();
  });

  window.PlanetarioUI = { abrirModal: abrirModal };

  // Botón "objeto aleatorio" del universo interactivo
  const btnAleatorio = document.getElementById("universo-aleatorio");
  if (btnAleatorio) {
    btnAleatorio.addEventListener("click", () => {
      const alAzar = DATOS[Math.floor(Math.random() * DATOS.length)];
      abrirModal(alAzar.id);
    });
  }

  /* ------------------------------------------------------------
     3. BUSCADOR
     Filtra por nombre y por tipo (planetas / estrellas / cometas)
     y muestra chips con las búsquedas más famosas.
     ------------------------------------------------------------ */
  const inputBusqueda = document.getElementById("search-input");
  const listaResultados = document.getElementById("search-results");
  const contenedorChips = document.getElementById("search-chips");
  const botonesFiltro = Array.from(document.querySelectorAll(".search__filter"));
  let filtroActivo = "todos";

  // Chips: objetos marcados como "famoso" en data.js
  DATOS.filter((d) => d.famoso).forEach((d) => {
    const chip = document.createElement("button");
    chip.className = "search__chip";
    chip.type = "button";
    chip.textContent = d.icono + " " + d.nombre;
    chip.addEventListener("click", () => abrirModal(d.id));
    contenedorChips.appendChild(chip);
  });

  // Cambiar de filtro re-ejecuta la búsqueda actual
  botonesFiltro.forEach((btn) =>
    btn.addEventListener("click", () => {
      botonesFiltro.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      filtroActivo = btn.dataset.filtro;
      buscar();
    })
  );

  // Normaliza texto para comparar sin acentos ni mayúsculas
  const normalizar = (texto) =>
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, ""); // elimina los diacríticos combinados

  function buscar() {
    const consulta = normalizar(inputBusqueda.value.trim());
    listaResultados.innerHTML = "";

    // Sin texto y sin filtro específico: cerrar el dropdown
    if (!consulta && filtroActivo === "todos") {
      listaResultados.classList.remove("is-abierto");
      return;
    }

    const coincidencias = DATOS.filter((d) => {
      const pasaFiltro = filtroActivo === "todos" || d.tipo === filtroActivo;
      const pasaTexto =
        !consulta ||
        normalizar(d.nombre).includes(consulta) ||
        normalizar(d.tipo).includes(consulta) ||
        normalizar(d.corto).includes(consulta);
      return pasaFiltro && pasaTexto;
    });

    if (coincidencias.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "search__sin-resultados";
      vacio.textContent = "Sin resultados para “" + inputBusqueda.value + "”. Prueba con “Halley” o “Marte”.";
      listaResultados.appendChild(vacio);
    } else {
      coincidencias.forEach((d) => {
        const item = document.createElement("li");
        item.setAttribute("role", "option");
        const boton = document.createElement("button");
        boton.className = "search__resultado";
        boton.type = "button";
        boton.innerHTML =
          "<span aria-hidden='true'>" + d.icono + "</span>" +
          "<span>" + d.nombre + "</span>" +
          "<span class='search__resultado-tipo'>" + d.tipo + "</span>";
        boton.addEventListener("click", () => {
          abrirModal(d.id);
          listaResultados.classList.remove("is-abierto");
        });
        item.appendChild(boton);
        listaResultados.appendChild(item);
      });
    }

    listaResultados.classList.add("is-abierto");
  }

  inputBusqueda.addEventListener("input", buscar);
  inputBusqueda.addEventListener("focus", () => {
    if (inputBusqueda.value.trim()) buscar();
  });

  // Cerrar el dropdown al hacer clic fuera del buscador
  document.addEventListener("click", (ev) => {
    if (!ev.target.closest(".search")) {
      listaResultados.classList.remove("is-abierto");
    }
  });

  /* ------------------------------------------------------------
     4. GALERÍA — transición automática cada 4 segundos EXACTOS
     ------------------------------------------------------------ */
  const marcoGaleria = document.getElementById("galeria-marco");
  const slides = Array.from(marcoGaleria.querySelectorAll(".galeria__slide"));
  const contenedorPuntos = document.getElementById("galeria-puntos");
  let slideActual = 0;
  let timerGaleria = null;

  // Crear un punto de navegación por imagen
  slides.forEach((_, i) => {
    const punto = document.createElement("button");
    punto.className = "galeria__punto" + (i === 0 ? " is-activa" : "");
    punto.type = "button";
    punto.setAttribute("aria-label", "Ver imagen " + (i + 1));
    punto.addEventListener("click", () => {
      irASlide(i);
      reiniciarTimerGaleria(); // el clic manual reinicia el conteo de 4 s
    });
    contenedorPuntos.appendChild(punto);
  });
  const puntos = Array.from(contenedorPuntos.children);

  function irASlide(indice) {
    slides[slideActual].classList.remove("is-activa");
    puntos[slideActual].classList.remove("is-activa");
    slideActual = (indice + slides.length) % slides.length;
    slides[slideActual].classList.add("is-activa");
    puntos[slideActual].classList.add("is-activa");
  }

  function reiniciarTimerGaleria() {
    clearInterval(timerGaleria);
    // 4000 ms exactos por imagen, según especificación
    timerGaleria = setInterval(() => irASlide(slideActual + 1), 4000);
  }

  reiniciarTimerGaleria();

  /* ------------------------------------------------------------
     5. ANIMACIONES DE APARICIÓN AL HACER SCROLL
     ------------------------------------------------------------ */
  const elementosReveal = Array.from(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    const observadorReveal = new IntersectionObserver(
      (entradas, obs) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("is-visible");
            obs.unobserve(entrada.target); // solo anima la primera vez
          }
        });
      },
      { threshold: 0.12 }
    );
    elementosReveal.forEach((el) => observadorReveal.observe(el));
  } else {
    elementosReveal.forEach((el) => el.classList.add("is-visible"));
  }

  /* ------------------------------------------------------------
     6. PESTAÑAS DE LA SECCIÓN EDUCATIVO
     ------------------------------------------------------------ */
  const tarjetasModulo = Array.from(document.querySelectorAll(".modulo-card"));
  const panelesModulo = Array.from(document.querySelectorAll(".modulo-panel"));

  tarjetasModulo.forEach((tarjeta) =>
    tarjeta.addEventListener("click", () => {
      const destino = "modulo-" + tarjeta.dataset.modulo;

      tarjetasModulo.forEach((t) => {
        const activa = t === tarjeta;
        t.classList.toggle("is-activa", activa);
        t.setAttribute("aria-selected", String(activa));
      });

      panelesModulo.forEach((panel) => {
        const mostrar = panel.id === destino;
        panel.hidden = !mostrar;
        panel.classList.toggle("is-activa", mostrar);
      });
    })
  );
})();
