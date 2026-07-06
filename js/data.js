/* ============================================================
   PLANETARIO AUSTRAL — js/data.js
   Base de datos de objetos celestes.
   La comparten: el buscador del inicio, el universo interactivo
   y la ventana modal de fichas.
   Todos los resúmenes se basan en fuentes oficiales:
   NASA Science (science.nasa.gov) y ESA (esa.int).
   ============================================================ */

// Se expone un único objeto global para mantener limpio el scope.
window.PLANETARIO_DATA = [
  /* ----------------------- PLANETAS ----------------------- */
  {
    id: "mercurio",
    nombre: "Mercurio",
    tipo: "planeta",
    icono: "🪨",
    famoso: false,
    corto: "El planeta más pequeño y el más cercano al Sol.",
    resumen:
      "Mercurio es el planeta más cercano al Sol y el más pequeño del sistema solar. " +
      "Es un mundo rocoso y su año dura solo 88 días terrestres.",
    fuente: "NASA Science — Solar System / NASA Space Place",
  },
  {
    id: "venus",
    nombre: "Venus",
    tipo: "planeta",
    icono: "🟠",
    famoso: false,
    corto: "El planeta más caliente del sistema solar.",
    resumen:
      "Venus es el segundo planeta desde el Sol y el sexto más grande. Está cubierto por nubes " +
      "cremosas de tonos blancos y castaños, y es el planeta más caliente del sistema solar, " +
      "pese a no ser el más cercano al Sol.",
    fuente: "NASA Science — Solar System / NASA Space Place",
  },
  {
    id: "tierra",
    nombre: "Tierra",
    tipo: "planeta",
    icono: "🌍",
    famoso: false,
    corto: "Nuestro hogar: el único planeta conocido con vida.",
    resumen:
      "La Tierra es el tercer planeta desde el Sol y el quinto más grande. Es nuestro hogar, " +
      "con océanos azules, superficie sólida y una única Luna.",
    fuente: "NASA Science — Solar System",
  },
  {
    id: "marte",
    nombre: "Marte",
    tipo: "planeta",
    icono: "🔴",
    famoso: true,
    corto: "El planeta rojo, explorado hoy por robots de la NASA.",
    resumen:
      "Marte es el cuarto planeta desde el Sol y el séptimo más grande. Su aspecto rojizo se debe " +
      "al polvo de su superficie. Tiene dos lunas pequeñas, Fobos y Deimos, y es el planeta más " +
      "explorado por misiones robóticas.",
    fuente: "NASA Science — Solar System",
  },
  {
    id: "jupiter",
    nombre: "Júpiter",
    tipo: "planeta",
    icono: "🟤",
    famoso: false,
    corto: "El planeta más grande del sistema solar.",
    resumen:
      "Júpiter es el quinto planeta desde el Sol y el más grande del sistema solar. Es un gigante " +
      "gaseoso con bandas de nubes de colores y la Gran Mancha Roja, una tormenta gigantesca " +
      "visible desde el espacio.",
    fuente: "NASA Science — Solar System",
  },
  {
    id: "saturno",
    nombre: "Saturno",
    tipo: "planeta",
    icono: "🪐",
    famoso: true,
    corto: "Famoso por su espectacular sistema de anillos.",
    resumen:
      "Saturno es el sexto planeta desde el Sol y el segundo más grande. Es un gigante gaseoso " +
      "célebre por su impresionante sistema de anillos.",
    fuente: "NASA Science — Solar System",
  },
  {
    id: "urano",
    nombre: "Urano",
    tipo: "planeta",
    icono: "🔵",
    famoso: false,
    corto: "El gigante helado que gira de lado.",
    resumen:
      "Urano es el séptimo planeta desde el Sol y el tercero más grande. Es un gigante helado de " +
      "color azul pálido y único en el sistema solar: gira prácticamente acostado sobre su órbita.",
    fuente: "NASA Science — Solar System / NASA Space Place",
  },
  {
    id: "neptuno",
    nombre: "Neptuno",
    tipo: "planeta",
    icono: "🔷",
    famoso: false,
    corto: "El planeta más lejano y el más frío.",
    resumen:
      "Neptuno es el octavo planeta, el más distante del Sol y el cuarto más grande. Es un gigante " +
      "helado azul con nubes y sistemas de tormentas visibles, y el planeta más frío del sistema solar.",
    fuente: "NASA Science — Solar System / NASA Space Place",
  },

  /* ----------------------- ESTRELLAS ----------------------- */
  {
    id: "sol",
    nombre: "El Sol",
    tipo: "estrella",
    icono: "☀️",
    famoso: true,
    corto: "Nuestra estrella: el 99,8 % de la masa del sistema solar.",
    resumen:
      "El Sol es una bola incandescente de hidrógeno y helio de 4500 millones de años. Mide " +
      "1,4 millones de km de diámetro, su núcleo alcanza unos 15 millones °C y concentra el " +
      "99,8 % de la masa del sistema solar. En su volumen cabrían 1,3 millones de Tierras.",
    fuente: "NASA Science — Sun Facts",
  },
  {
    id: "sirio",
    nombre: "Sirio",
    tipo: "estrella",
    icono: "✨",
    famoso: true,
    corto: "La estrella más brillante del cielo nocturno.",
    resumen:
      "Sirio, en la constelación del Can Mayor, es la estrella más brillante de nuestro cielo " +
      "nocturno. En realidad es un sistema doble: la luminosa Sirio A y una pequeña enana blanca, " +
      "Sirio B.",
    fuente: "NASA Science — Stars",
  },
  {
    id: "betelgeuse",
    nombre: "Betelgeuse",
    tipo: "estrella",
    icono: "🌟",
    famoso: false,
    corto: "Supergigante roja en Orión; terminará en supernova.",
    resumen:
      "Betelgeuse es una supergigante roja en la constelación de Orión, una estrella masiva en la " +
      "etapa final de su vida. Las estrellas de este tipo fusionan elementos cada vez más pesados " +
      "hasta el hierro y terminan explotando como supernovas.",
    fuente: "NASA Science — Stars",
  },
  {
    id: "proxima",
    nombre: "Próxima Centauri",
    tipo: "estrella",
    icono: "🔥",
    famoso: false,
    corto: "La estrella más cercana al Sol.",
    resumen:
      "Próxima Centauri es la estrella más cercana a nuestro Sol, a poco más de 4 años luz. Es una " +
      "enana roja pequeña y tenue: las estrellas de baja masa como ella consumen su combustible tan " +
      "despacio que pueden brillar billones de años.",
    fuente: "NASA Science — Stars",
  },
  {
    id: "polaris",
    nombre: "Polaris",
    tipo: "estrella",
    icono: "⭐",
    famoso: false,
    corto: "La Estrella Polar, guía del hemisferio norte.",
    resumen:
      "Polaris, la Estrella Polar, marca casi exactamente el norte celeste, por lo que ha guiado a " +
      "navegantes durante siglos. Es un sistema estelar múltiple encabezado por una supergigante.",
    fuente: "NASA Science — Stars",
  },

  /* ----------------------- COMETAS ----------------------- */
  {
    id: "halley",
    nombre: "Cometa Halley (1P)",
    tipo: "cometa",
    icono: "☄️",
    famoso: true,
    corto: "El cometa más famoso: visita la Tierra cada ~76 años.",
    resumen:
      "El cometa Halley es el más famoso de todos: es visible desde la Tierra aproximadamente cada " +
      "76 años. Como todo cometa, es una \"bola de nieve cósmica\" de gases congelados, roca y polvo " +
      "que al acercarse al Sol despliega una cola de millones de kilómetros.",
    fuente: "NASA Science — Comets",
  },
  {
    id: "67p",
    nombre: "67P/Churyumov-Gerasimenko",
    tipo: "cometa",
    icono: "🛰️",
    famoso: false,
    corto: "El cometa donde aterrizó la sonda Philae de la ESA.",
    resumen:
      "El cometa 67P/Churyumov-Gerasimenko fue explorado por la misión Rosetta de la Agencia " +
      "Espacial Europea, que lo orbitó y en 2014 posó sobre su superficie el módulo Philae: el " +
      "primer aterrizaje de la historia sobre un cometa.",
    fuente: "ESA — Misión Rosetta",
  },
  {
    id: "halebopp",
    nombre: "Hale-Bopp (C/1995 O1)",
    tipo: "cometa",
    icono: "💫",
    famoso: false,
    corto: "Uno de los cometas más brillantes del siglo XX.",
    resumen:
      "Hale-Bopp fue uno de los cometas más brillantes del siglo XX y pudo verse a simple vista " +
      "durante meses en 1996 y 1997. Los cometas provienen del Cinturón de Kuiper y de la lejana " +
      "Nube de Oort, donde probablemente orbitan miles de millones de ellos.",
    fuente: "NASA Science — Comets",
  },

  /* ----------------------- OTROS OBJETOS ----------------------- */
  {
    id: "sagitario-a",
    nombre: "Sagitario A*",
    tipo: "agujero negro",
    icono: "🕳️",
    famoso: true,
    corto: "El agujero negro supermasivo del centro de la Vía Láctea.",
    resumen:
      "Sagitario A* es el agujero negro supermasivo del centro de nuestra galaxia, con una masa de " +
      "4 millones de soles. Bajo su horizonte de sucesos la gravedad es tan intensa que nada — ni " +
      "siquiera la luz — puede escapar.",
    fuente: "NASA Science — Black Holes",
  },
  {
    id: "via-lactea",
    nombre: "Vía Láctea",
    tipo: "galaxia",
    icono: "🌌",
    famoso: false,
    corto: "Nuestra galaxia: un disco de más de 100 000 años luz.",
    resumen:
      "La Vía Láctea es nuestra galaxia espiral: un disco de estrellas de más de 100 000 años luz " +
      "con más de 100 000 millones de estrellas. El sistema solar tarda unos 240 millones de años " +
      "en darle una sola vuelta.",
    fuente: "NASA Science — Galaxies",
  },
  {
    id: "andromeda",
    nombre: "Galaxia de Andrómeda",
    tipo: "galaxia",
    icono: "🌀",
    famoso: false,
    corto: "Nuestra gran vecina galáctica más cercana.",
    resumen:
      "Andrómeda es la gran galaxia más cercana a la Vía Láctea. Ambas forman parte del Grupo " +
      "Local, un vecindario cósmico de más de 50 galaxias unidas por la gravedad.",
    fuente: "NASA Science — Galaxies",
  },
];
