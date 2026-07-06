/* ============================================================
   PLANETARIO AUSTRAL — js/universe.js
   Universo interactivo del hero: una Vía Láctea en miniatura
   dibujada en <canvas>, con:
     · Estrellas de fondo que parpadean + estrellas famosas con nombre
     · Mini sistema solar con planetas orbitando
     · Cometas en movimiento con cola (apuntando lejos del Sol)
     · Agujero negro Sagitario A* con disco de acreción
     · Galaxia de Andrómeda al fondo
   Interacción: hover → tooltip con botón · clic → modal de ficha.

   CRÍTICO (rendimiento): en pantallas ≤ 900px NO se inicializa
   nada de esto — ni canvas, ni animación, ni listeners.
   ============================================================ */

(function () {
  "use strict";

  const mqMovil = window.matchMedia("(max-width: 900px)");
  const canvas = document.getElementById("universo-canvas");
  const tooltip = document.getElementById("universo-tooltip");
  if (!canvas || !tooltip) return;

  const contenedor = canvas.parentElement;
  const tooltipNombre = tooltip.querySelector(".universo__tooltip-nombre");
  const tooltipTexto = tooltip.querySelector(".universo__tooltip-texto");
  const tooltipBtn = document.getElementById("universo-tooltip-btn");

  const DATOS = window.PLANETARIO_DATA || [];
  const dato = (id) => DATOS.find((d) => d.id === id);

  /* ------------------------------------------------------------
     Estado general
     ------------------------------------------------------------ */
  let ctx = null;
  let iniciado = false;      // ¿ya se construyó todo?
  let corriendo = false;     // ¿el bucle de animación está activo?
  let enPantalla = true;     // visibilidad según IntersectionObserver
  let rafId = null;
  let W = 0, H = 0;          // tamaño en píxeles CSS
  let fondo = null;          // canvas fuera de pantalla con la galaxia
  let hover = null;          // cuerpo actualmente bajo el cursor
  let timerOcultar = null;   // temporizador para esconder el tooltip

  /* ------------------------------------------------------------
     Cuerpos celestes del mapa
     Posiciones en coordenadas relativas (0–1) para sobrevivir al resize.
     ------------------------------------------------------------ */

  // Estrellas famosas (interactivas, con brillo pulsante)
  const estrellas = [
    { id: "sirio", rx: 0.14, ry: 0.16, r: 4.2, color: "#dbeafe", fase: 0.5 },
    { id: "betelgeuse", rx: 0.87, ry: 0.14, r: 4.6, color: "#fca5a5", fase: 2.1 },
    { id: "polaris", rx: 0.08, ry: 0.5, r: 3.6, color: "#fef9c3", fase: 4.0 },
    { id: "proxima", rx: 0.93, ry: 0.62, r: 3.2, color: "#fdba74", fase: 1.3 },
  ];

  // Mini sistema solar: el Sol + 8 planetas en órbita
  const SOL = { id: "sol", rx: 0.3, ry: 0.72, r: 11 };
  const planetas = [
    { id: "mercurio", orbita: 20, r: 2.0, vel: 1.9, color: "#9ca3af", fase: 0.2 },
    { id: "venus", orbita: 29, r: 2.8, vel: 1.5, color: "#e8c39e", fase: 2.4 },
    { id: "tierra", orbita: 38, r: 3.0, vel: 1.25, color: "#4d96ff", fase: 4.1 },
    { id: "marte", orbita: 47, r: 2.5, vel: 1.05, color: "#e2604a", fase: 1.0 },
    { id: "jupiter", orbita: 60, r: 5.2, vel: 0.75, color: "#d9a066", fase: 3.2 },
    { id: "saturno", orbita: 74, r: 4.6, vel: 0.6, color: "#e8d191", fase: 5.3, anillo: true },
    { id: "urano", orbita: 86, r: 3.6, vel: 0.48, color: "#7fdbff", fase: 0.9 },
    { id: "neptuno", orbita: 97, r: 3.5, vel: 0.4, color: "#5b7fff", fase: 2.8 },
  ];

  // Agujero negro en el corazón de la galaxia
  const AGUJERO = { id: "sagitario-a", rx: 0.66, ry: 0.34, r: 8 };

  // Andrómeda, pequeña y lejana en una esquina
  const ANDROMEDA = { id: "andromeda", rx: 0.55, ry: 0.88, r: 10 };

  // Cometas viajeros (posición y velocidad en px, se reinician al salir)
  const cometas = [
    { id: "halley", x: 0, y: 0, vx: 0, vy: 0, r: 3.4, activo: false },
    { id: "67p", x: 0, y: 0, vx: 0, vy: 0, r: 2.8, activo: false },
    { id: "halebopp", x: 0, y: 0, vx: 0, vy: 0, r: 3.0, activo: false },
  ];

  // Estrellas decorativas de fondo (no interactivas)
  const fondoEstrellas = [];

  // Lista unificada para hover/clic; cada frame se actualizan sx/sy (px)
  let interactivos = [];

  /* ------------------------------------------------------------
     Inicialización y tamaño
     ------------------------------------------------------------ */
  function init() {
    if (iniciado) return;
    iniciado = true;
    ctx = canvas.getContext("2d");

    // Estrellas de fondo con posición y ritmo de parpadeo aleatorios
    for (let i = 0; i < 130; i++) {
      fondoEstrellas.push({
        rx: Math.random(),
        ry: Math.random(),
        r: Math.random() * 1.3 + 0.4,
        fase: Math.random() * Math.PI * 2,
        vel: Math.random() * 1.5 + 0.5,
        dorada: Math.random() < 0.12, // algunas doradas para dar calidez
      });
    }

    interactivos = [
      { id: SOL.id, ref: SOL },
      ...estrellas.map((e) => ({ id: e.id, ref: e })),
      ...planetas.map((p) => ({ id: p.id, ref: p })),
      { id: AGUJERO.id, ref: AGUJERO },
      { id: ANDROMEDA.id, ref: ANDROMEDA },
      ...cometas.map((c) => ({ id: c.id, ref: c })),
    ];

    ajustarTamano();
    cometas.forEach(reiniciarCometa);

    // --- Listeners de interacción ---
    canvas.addEventListener("mousemove", alMoverCursor);
    canvas.addEventListener("mouseleave", () => programarOcultarTooltip(250));
    canvas.addEventListener("click", alHacerClic);

    // El tooltip se mantiene mientras el cursor esté sobre él
    tooltip.addEventListener("mouseenter", () => clearTimeout(timerOcultar));
    tooltip.addEventListener("mouseleave", () => programarOcultarTooltip(150));
    tooltipBtn.addEventListener("click", () => {
      if (hover && window.PlanetarioUI) window.PlanetarioUI.abrirModal(hover.id);
      ocultarTooltip();
    });

    // Pausar cuando el hero sale de pantalla (ahorro de CPU)
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (entradas) => {
          enPantalla = entradas[0].isIntersecting;
          actualizarBucle();
        },
        { threshold: 0.05 }
      ).observe(canvas);
    }

    // Pausar cuando la pestaña queda en segundo plano
    document.addEventListener("visibilitychange", actualizarBucle);

    // Redibujar al cambiar el tamaño de la ventana (con pequeño debounce)
    let timerResize = null;
    window.addEventListener("resize", () => {
      if (mqMovil.matches) return;
      clearTimeout(timerResize);
      timerResize = setTimeout(ajustarTamano, 150);
    });

    actualizarBucle();
  }

  function ajustarTamano() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = contenedor.clientWidth;
    H = contenedor.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    prerenderFondo();
  }

  // Escala general: los tamaños base están pensados para ~420px
  const escala = () => Math.min(W, H) / 420;

  /* ------------------------------------------------------------
     Fondo pre-renderizado: nebulosa + brazos espirales estáticos
     (se dibuja una sola vez por resize; el bucle solo lo copia)
     ------------------------------------------------------------ */
  function prerenderFondo() {
    fondo = document.createElement("canvas");
    fondo.width = Math.max(W, 1);
    fondo.height = Math.max(H, 1);
    const fctx = fondo.getContext("2d");

    const cx = AGUJERO.rx * W;
    const cy = AGUJERO.ry * H;
    const s = escala();

    // Resplandor de nebulosa alrededor del núcleo galáctico
    let g = fctx.createRadialGradient(cx, cy, 0, cx, cy, 190 * s);
    g.addColorStop(0, "rgba(139, 122, 246, 0.30)");
    g.addColorStop(0.35, "rgba(99, 102, 241, 0.16)");
    g.addColorStop(0.7, "rgba(99, 102, 241, 0.05)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    fctx.fillStyle = g;
    fctx.fillRect(0, 0, W, H);

    // Segundo velo dorado suave cerca del sistema solar
    g = fctx.createRadialGradient(SOL.rx * W, SOL.ry * H, 0, SOL.rx * W, SOL.ry * H, 140 * s);
    g.addColorStop(0, "rgba(251, 191, 36, 0.08)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    fctx.fillStyle = g;
    fctx.fillRect(0, 0, W, H);

    // Dos brazos espirales de puntitos (espiral logarítmica)
    for (let brazo = 0; brazo < 2; brazo++) {
      const giro = brazo * Math.PI;
      for (let t = 0.3; t < 3.6 * Math.PI; t += 0.05) {
        const radio = 5 * Math.exp(0.16 * t) * s;
        if (radio > Math.max(W, H)) break;
        const x = cx + Math.cos(t + giro) * radio + (Math.random() - 0.5) * 14 * s;
        const y = cy + Math.sin(t + giro) * radio * 0.6 + (Math.random() - 0.5) * 14 * s;
        const alfa = Math.max(0.05, 0.4 - t * 0.035);
        fctx.fillStyle =
          Math.random() < 0.15
            ? "rgba(196, 181, 253, " + alfa + ")"
            : "rgba(255, 255, 255, " + alfa + ")";
        fctx.beginPath();
        fctx.arc(x, y, Math.random() * 1.1 + 0.3, 0, Math.PI * 2);
        fctx.fill();
      }
    }
  }

  /* ------------------------------------------------------------
     Cometas: nacen en un borde y cruzan el mapa lentamente
     ------------------------------------------------------------ */
  function reiniciarCometa(c) {
    const s = escala();
    const desdeIzquierda = Math.random() < 0.5;
    c.x = desdeIzquierda ? -30 : W + 30;
    c.y = Math.random() * H * 0.7 + H * 0.1;
    const rapidez = (Math.random() * 14 + 12) * s;
    const angulo = (Math.random() * 0.5 - 0.25) + (desdeIzquierda ? 0 : Math.PI);
    c.vx = Math.cos(angulo) * rapidez;
    c.vy = Math.sin(angulo) * rapidez;
    c.activo = true;
  }

  /* ------------------------------------------------------------
     Bucle de animación
     ------------------------------------------------------------ */
  function actualizarBucle() {
    const debeCorrer =
      iniciado && enPantalla && !document.hidden && !mqMovil.matches;
    if (debeCorrer && !corriendo) {
      corriendo = true;
      ultimoT = performance.now();
      rafId = requestAnimationFrame(cuadro);
    } else if (!debeCorrer && corriendo) {
      corriendo = false;
      cancelAnimationFrame(rafId);
    }
  }

  let ultimoT = 0;

  function cuadro(ahora) {
    if (!corriendo) return;
    const dt = Math.min((ahora - ultimoT) / 1000, 0.05); // segundos, acotado
    ultimoT = ahora;
    const t = ahora / 1000;

    ctx.clearRect(0, 0, W, H);
    if (fondo) ctx.drawImage(fondo, 0, 0, W, H);

    dibujarEstrellasFondo(t);
    dibujarAndromeda(t);
    dibujarAgujeroNegro(t);
    dibujarEstrellasFamosas(t);
    dibujarSistemaSolar(t);
    dibujarCometas(dt);

    rafId = requestAnimationFrame(cuadro);
  }

  /* --------- Dibujo: estrellas de fondo (parpadeo) --------- */
  function dibujarEstrellasFondo(t) {
    for (const e of fondoEstrellas) {
      const alfa = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * e.vel + e.fase));
      ctx.fillStyle = e.dorada
        ? "rgba(251, 191, 36, " + alfa + ")"
        : "rgba(255, 255, 255, " + alfa + ")";
      ctx.beginPath();
      ctx.arc(e.rx * W, e.ry * H, e.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* --------- Dibujo: estrellas famosas (interactivas) --------- */
  function dibujarEstrellasFamosas(t) {
    for (const e of estrellas) {
      const x = (e.sx = e.rx * W);
      const y = (e.sy = e.ry * H);
      const pulso = 1 + 0.18 * Math.sin(t * 2 + e.fase);
      const r = e.r * escala() * 1.6 * pulso;

      // Halo
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
      g.addColorStop(0, e.color);
      g.addColorStop(0.25, "rgba(255,255,255,0.25)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 4, 0, Math.PI * 2);
      ctx.fill();

      // Núcleo
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
      ctx.fill();

      // Destello en cruz
      ctx.strokeStyle = "rgba(255,255,255," + (0.5 * pulso) + ")";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - r * 2.6, y); ctx.lineTo(x + r * 2.6, y);
      ctx.moveTo(x, y - r * 2.6); ctx.lineTo(x, y + r * 2.6);
      ctx.stroke();
    }
  }

  /* --------- Dibujo: mini sistema solar --------- */
  function dibujarSistemaSolar(t) {
    const s = escala();
    const sx = (SOL.sx = SOL.rx * W);
    const sy = (SOL.sy = SOL.ry * H);

    // Órbitas tenues
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    for (const p of planetas) {
      ctx.beginPath();
      ctx.arc(sx, sy, p.orbita * s, 0, Math.PI * 2);
      ctx.stroke();
    }

    // El Sol con resplandor pulsante
    const pulsoSol = 1 + 0.05 * Math.sin(t * 1.4);
    const rSol = SOL.r * s * pulsoSol;
    let g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rSol * 3.2);
    g.addColorStop(0, "rgba(255, 236, 170, 0.95)");
    g.addColorStop(0.3, "rgba(251, 191, 36, 0.5)");
    g.addColorStop(1, "rgba(251, 191, 36, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, sy, rSol * 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffd76a";
    ctx.beginPath();
    ctx.arc(sx, sy, rSol, 0, Math.PI * 2);
    ctx.fill();

    // Planetas orbitando (velocidad angular propia de cada uno)
    for (const p of planetas) {
      const ang = t * p.vel * 0.35 + p.fase;
      const x = (p.sx = sx + Math.cos(ang) * p.orbita * s);
      const y = (p.sy = sy + Math.sin(ang) * p.orbita * s);
      const r = Math.max(p.r * s, 1.6);

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Anillo de Saturno
      if (p.anillo) {
        ctx.strokeStyle = "rgba(232, 209, 145, 0.75)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(x, y, r * 2.1, r * 0.75, -0.45, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  /* --------- Dibujo: agujero negro Sagitario A* --------- */
  function dibujarAgujeroNegro(t) {
    const s = escala();
    const x = (AGUJERO.sx = AGUJERO.rx * W);
    const y = (AGUJERO.sy = AGUJERO.ry * H);
    const r = AGUJERO.r * s;

    // Disco de acreción giratorio (elipse con gradiente que rota)
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.5);
    const g = ctx.createLinearGradient(-r * 3, 0, r * 3, 0);
    g.addColorStop(0, "rgba(251, 191, 36, 0)");
    g.addColorStop(0.3, "rgba(251, 191, 36, 0.85)");
    g.addColorStop(0.6, "rgba(255, 138, 76, 0.9)");
    g.addColorStop(1, "rgba(139, 92, 246, 0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 2.4, r * 0.9, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Anillo de fotones + sombra central
    ctx.strokeStyle = "rgba(255, 210, 120, 0.9)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.15, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /* --------- Dibujo: Andrómeda --------- */
  function dibujarAndromeda(t) {
    const s = escala();
    const x = (ANDROMEDA.sx = ANDROMEDA.rx * W);
    const y = (ANDROMEDA.sy = ANDROMEDA.ry * H);
    const r = ANDROMEDA.r * s;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.5 + Math.sin(t * 0.1) * 0.03);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.2);
    g.addColorStop(0, "rgba(224, 231, 255, 0.85)");
    g.addColorStop(0.3, "rgba(165, 180, 252, 0.4)");
    g.addColorStop(1, "rgba(99, 102, 241, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 2.2, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* --------- Dibujo: cometas con cola --------- */
  function dibujarCometas(dt) {
    for (const c of cometas) {
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      if (c.x < -60 || c.x > W + 60 || c.y < -60 || c.y > H + 60) {
        reiniciarCometa(c);
      }
      c.sx = c.x;
      c.sy = c.y;

      // La cola siempre apunta en dirección opuesta al Sol (dato NASA)
      const dx = c.x - SOL.sx;
      const dy = c.y - SOL.sy;
      const dist = Math.hypot(dx, dy) || 1;
      const largo = 55 * escala();
      const fx = c.x + (dx / dist) * largo;
      const fy = c.y + (dy / dist) * largo;

      const g = ctx.createLinearGradient(c.x, c.y, fx, fy);
      g.addColorStop(0, "rgba(191, 219, 254, 0.9)");
      g.addColorStop(0.4, "rgba(147, 197, 253, 0.35)");
      g.addColorStop(1, "rgba(147, 197, 253, 0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(fx, fy);
      ctx.stroke();

      // Núcleo brillante
      ctx.fillStyle = "#e0f2fe";
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r * escala(), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ------------------------------------------------------------
     Interacción: hover con tooltip y clic para abrir el modal
     ------------------------------------------------------------ */
  function buscarCuerpoEn(x, y) {
    let mejor = null;
    let mejorDist = Infinity;
    for (const c of interactivos) {
      const ref = c.ref;
      if (ref.sx === undefined) continue;
      const d = Math.hypot(ref.sx - x, ref.sy - y);
      const radioHit = Math.max((ref.r || 3) * escala() * 2, 16);
      if (d < radioHit && d < mejorDist) {
        mejor = c;
        mejorDist = d;
      }
    }
    return mejor;
  }

  function alMoverCursor(ev) {
    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const cuerpo = buscarCuerpoEn(x, y);

    canvas.classList.toggle("is-hover", !!cuerpo);

    if (cuerpo) {
      if (hover !== cuerpo) {
        hover = cuerpo;
        mostrarTooltip(cuerpo);
      }
      clearTimeout(timerOcultar);
    } else if (hover) {
      programarOcultarTooltip(300);
    }
  }

  function mostrarTooltip(cuerpo) {
    const info = dato(cuerpo.id);
    if (!info) return;

    tooltipNombre.textContent = info.icono + " " + info.nombre;
    tooltipTexto.textContent = info.corto;
    tooltip.hidden = false;

    // Posicionar cerca del objeto sin salirse del contenedor
    const margen = 10;
    let tx = cuerpo.ref.sx + 18;
    let ty = cuerpo.ref.sy - 12;
    tooltip.style.left = "0px";
    tooltip.style.top = "0px";
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    if (tx + tw + margen > W) tx = cuerpo.ref.sx - tw - 18;
    if (ty + th + margen > H) ty = H - th - margen;
    if (ty < margen) ty = margen;
    if (tx < margen) tx = margen;
    tooltip.style.left = tx + "px";
    tooltip.style.top = ty + "px";
  }

  function programarOcultarTooltip(ms) {
    clearTimeout(timerOcultar);
    timerOcultar = setTimeout(ocultarTooltip, ms);
  }

  function ocultarTooltip() {
    tooltip.hidden = true;
    hover = null;
    canvas.classList.remove("is-hover");
  }

  function alHacerClic(ev) {
    const rect = canvas.getBoundingClientRect();
    const cuerpo = buscarCuerpoEn(ev.clientX - rect.left, ev.clientY - rect.top);
    if (cuerpo && window.PlanetarioUI) {
      ocultarTooltip();
      window.PlanetarioUI.abrirModal(cuerpo.id);
    }
  }

  /* ------------------------------------------------------------
     Arranque condicionado al tamaño de pantalla
     ------------------------------------------------------------ */
  if (!mqMovil.matches) init();

  // Si el usuario rota el dispositivo o agranda la ventana, se
  // inicializa recién entonces; si pasa a móvil, se pausa.
  const alCambiarMedia = (e) => {
    if (!e.matches) {
      if (!iniciado) init();
      else ajustarTamano();
    }
    actualizarBucle();
  };
  if (mqMovil.addEventListener) mqMovil.addEventListener("change", alCambiarMedia);
  else if (mqMovil.addListener) mqMovil.addListener(alCambiarMedia); // Safari antiguo
})();
