import type { Locale } from "./rv-store";
import type { Category, Condition, Listing, RaceSurface } from "./types";

const EN = {
  kicker: "Powersports",
  hero: "Dirt. Asphalt. Ready.",
  sub: "Snap a part. Get a summary. Voice-describe it. Pick ATV, truck, dirt bike, racecar, or snowmobile — racing is Dirt, Asphalt, or Offroad — then search or list it.",
  scanCta: "Identify a part",
  marketCta: "Market",
  market: "Market",
  scan: "Identify",
  home: "Home",
  about: "About",
  shopBy: "Shop by category",
  identifyCard: "Identify a part",
  identifyCardSub: "Snap, summary, voice, then pick ATV / truck / dirt bike / racecar / snowmobile",
  marketCard: "Market",
  marketCardSub: "Search those same categories. Racing is Dirt, Asphalt, or Offroad.",
  footer: "Powersports parts. Private-party board. No whole-vehicle sales.",
  download: "Download files",
  downloadHint: "Full site folder for your computer — unzip, then open rv-chain.",
  cat: {
    atv: "ATV",
    truck: "Truck",
    dirtbike: "Dirt bike",
    racecar: "Racecar",
    snowmobile: "Snowmobile",
  },
  surface: {
    dirt: "Dirt",
    asphalt: "Asphalt",
    offroad: "Offroad",
  },
  condition: {
    new: "New",
    "like-new": "Like new",
    used: "Used",
    "for-parts": "For parts",
  },
  samples: {
    "cvt-belt": "Drive belt",
    piston: "Piston",
    "mud-tire": "Mud tire",
    ski: "Ski",
    beadlock: "Beadlock",
  },
  part: "Part",
  identify: {
    kicker: "Identify",
    title: "Snap the part",
    intro:
      "Photo first. You get a general summary. Then voice-describe it, pick a main category, and fix anything by hand.",
    step1: "1. Fill the frame with the part — casts, teeth, mounts.",
    step2: "2. Read the summary. Talk if the photo guess is off.",
    step3: "3. Choose ATV, Truck, Dirt bike, Racecar, or Snowmobile. Racing splits into Dirt, Asphalt, and Offroad.",
    step4: "4. Edit details if needed, then search the board or list the part.",
    takePhoto: "Take photo",
    rearCamera: "Rear camera",
    gallery: "Photo gallery",
    galleryHint: "Choose an existing shot",
    trySample: "Try a sample",
    writing: "Writing a general summary…",
    summary: "Summary",
    guess: "Guess",
    wsStep1: "1. Voice-describe anything the photo missed — year, rig, wear, asking price, town.",
    wsStep2: "2. Pick a main category. Racing is Racecar, then Dirt, Asphalt, or Offroad.",
    wsStep3: "3. Tap Edit details only if you need to correct a field by hand.",
    transcript: "Transcript",
    transcriptPh: "2019 Sportsman, used two seasons, asking 85, pickup in Clay…",
    mainCategory: "Main category",
    mainCategoryHint:
      "Choose where this part belongs. If it is racing, tap Racecar, then Dirt, Asphalt, or Offroad.",
    racingSurface: "Racing surface",
    hideDetails: "Hide details",
    editDetails: "Edit details",
    partName: "Part name",
    fitment: "Fitment",
    condition: "Condition",
    askingPrice: "Asking price",
    searchBoard: "Search the board",
    listPart: "List this part",
    writingListing: "Writing listing…",
    readyToPost: "Ready to post",
    adTitle: "Title",
    price: "Price",
    pickup: "Pickup",
    pickupPh: "Town, ST",
    listing: "Listing",
    postListing: "Post listing",
    reshoot: "Reshoot",
    onTheBoard: "On the board",
  },
  toast: {
    identifyFailed: "Identify failed",
    choosePhoto: "Choose a photo of the part",
    couldNotRead: "Could not read that photo",
    couldNotLoadSample: "Could not load that sample",
    pickCategoryFirst: "Pick a main category first",
    racecarNeedsSurface: "Racecar parts need Dirt, Asphalt, or Offroad",
    couldNotWrite: "Could not write the listing",
    listingPosted: "Listing is on the board",
  },
  talk: {
    listening: "Listening",
    voice: "Voice description",
    stop: "Stop voice description",
    start: "Edit with voice description",
    defaultHint:
      "This overrides the photo guess. Speak clearly, then fix the transcript if the mic slips.",
    unsupported:
      "Voice isn’t available in this browser. Type year, rig, condition, price, and town below.",
    blocked: "Mic permission blocked. Type the description instead, or allow the microphone.",
    noSpeech: "Didn’t catch that — keep going, or type it.",
    couldntHear: "Couldn’t hear that. Type the description so it stays accurate.",
    paused: "Paused. Tap again to add more.",
    checkTranscript: "Check the transcript. Fix anything the mic missed.",
    speakHint: "Say the year, rig, what’s wrong, asking price, and pickup town.",
    couldntStart: "Couldn’t start the mic. Type the description instead.",
    notAvailable: "Voice isn’t available here — type the description below.",
  },
  marketPage: {
    kicker: "Private-party board",
    title: "Market",
    intro:
      "Search ATV, truck, dirt bike, racecar, and snowmobile parts. Racing splits into Dirt, Asphalt, and Offroad. You list. Buyers contact you. No escrow cut.",
    myAds: "My ads",
    searchPh: "Search belts, beadlocks, calipers, skid plates…",
    searchAria: "Search parts",
    identifyAria: "Identify a part",
    mainCategory: "Main category",
    racingDirtAsphalt: "Racing — Dirt, Asphalt, or Offroad",
    alsoOnBoard: "Also on the board",
    all: "All",
    results: "Results",
    onTheBoard: "On the board",
    nothingMatches: "Nothing matches",
    emptyHint: "Try another word, or identify a part and search from the photo.",
  },
  aboutPage: {
    kicker: "rv-chain.com",
    title: "About RV Chain",
    p1: "RV Chain is a powersports parts board — ATVs, off-road trucks, dirt bikes, snowmobiles, and racecars on Dirt, Asphalt, or Offroad. Identify a part from a photo, then search or list it.",
    p2: "Identify is the front door: snap a photo, read a general summary, voice-describe the part, pick ATV / truck / dirt bike / racecar (Dirt, Asphalt, or Offroad) / snowmobile, then search the board or list it.",
    p3: "Market is a simple gear and parts board. You list. Buyers contact you. No escrow cut. No whole-vehicle dealership.",
    li1: "Powersports only — no camping, no campers, no campgrounds.",
    li2: "We are not a vehicle dealer.",
    li3: "We are not a middleman holding your money.",
    questions: "Questions: admin@rv-chain.com",
  },
  adsPage: {
    title: "My ads",
    intro: "Ads you posted from Identify stay on this device.",
    empty: "No ads yet",
    emptyHint: "Photograph a part, voice-describe it, pick a category, then list it.",
    remove: "Remove",
  },
  listingPage: {
    notFound: "Ad not found",
    loading: "Loading",
    stale: "It may have been taken down, or this link is stale.",
    pulling: "Pulling the listing…",
    backToMarket: "Back to Market",
    yourAd: "Your ad",
    yourAds: "Your ads",
    identifySimilar: "Identify a similar part",
    contactSeller: "Contact seller",
    inquiryCopied: "Inquiry copied — paste it to the seller",
    couldNotCopy: "Could not copy",
    inquiryPrefix: "Interested in your RV Chain listing:",
    pickupPrefix: "Pickup:",
    privateParty: "Private-party. No escrow. You and the seller work it out.",
    related: "Related",
  },
  sponsors: "Sponsors",
  sponsorsPage: {
    kicker: "Supportive sponsors",
    title: "Sponsors",
  },
} as const;

const ES: Widen<typeof EN> = {
  kicker: "Powersports",
  hero: "Dirt. Asphalt. Listo.",
  sub: "Foto de la pieza, resumen, voz. Elige ATV, camioneta, dirt bike, auto de carrera o moto de nieve — Dirt, Asphalt u Offroad — y busca o publícala.",
  scanCta: "Identificar una pieza",
  marketCta: "Mercado",
  market: "Mercado",
  scan: "Identificar",
  home: "Inicio",
  about: "Acerca de",
  shopBy: "Por categoría",
  identifyCard: "Identificar una pieza",
  identifyCardSub: "Foto, resumen, voz, luego elige ATV / camioneta / dirt bike / auto de carrera / moto de nieve",
  marketCard: "Mercado",
  marketCardSub: "Busca en esas mismas categorías. Las carreras son Dirt, Asphalt u Offroad.",
  footer: "Piezas de powersports. Tablero de particulares. Sin venta de vehículos completos.",
  download: "Descargar archivos",
  downloadHint: "Carpeta completa del sitio — descomprime y abre rv-chain.",
  cat: {
    atv: "ATV",
    truck: "Camioneta",
    dirtbike: "Dirt bike",
    racecar: "Auto de carrera",
    snowmobile: "Moto de nieve",
  },
  surface: {
    dirt: "Dirt",
    asphalt: "Asphalt",
    offroad: "Offroad",
  },
  condition: {
    new: "Nuevo",
    "like-new": "Como nuevo",
    used: "Usado",
    "for-parts": "Para piezas",
  },
  samples: {
    "cvt-belt": "Banda",
    piston: "Pistón",
    "mud-tire": "Llanta de lodo",
    ski: "Ski",
    beadlock: "Beadlock",
  },
  part: "Pieza",
  identify: {
    kicker: "Identificar",
    title: "Foto de la pieza",
    intro:
      "Primero la foto. Recibes un resumen general. Luego descríbela por voz, elige una categoría principal y corrige lo que haga falta a mano.",
    step1: "1. Llena el encuadre con la pieza — fundiciones, dientes, soportes.",
    step2: "2. Lee el resumen. Habla si la foto se equivocó.",
    step3: "3. Elige ATV, Camioneta, Dirt bike, Auto de carrera o Moto de nieve. Las carreras se dividen en Dirt, Asphalt y Offroad.",
    step4: "4. Edita los detalles si hace falta, luego busca en el tablero o publica la pieza.",
    takePhoto: "Tomar foto",
    rearCamera: "Cámara trasera",
    gallery: "Galería",
    galleryHint: "Elige una foto existente",
    trySample: "Probar una muestra",
    writing: "Escribiendo un resumen general…",
    summary: "Resumen",
    guess: "Estimación",
    wsStep1: "1. Describe por voz lo que la foto no vio — año, máquina, desgaste, precio, pueblo.",
    wsStep2: "2. Elige una categoría principal. Las carreras son Auto de carrera, luego Dirt, Asphalt u Offroad.",
    wsStep3: "3. Toca Editar detalles solo si necesitas corregir un campo a mano.",
    transcript: "Transcripción",
    transcriptPh: "Sportsman 2019, dos temporadas, pido 85, recoger en Clay…",
    mainCategory: "Categoría principal",
    mainCategoryHint:
      "Elige dónde va esta pieza. Si es de carrera, toca Auto de carrera, luego Dirt, Asphalt u Offroad.",
    racingSurface: "Superficie de carrera",
    hideDetails: "Ocultar detalles",
    editDetails: "Editar detalles",
    partName: "Nombre de la pieza",
    fitment: "Encaje",
    condition: "Condición",
    askingPrice: "Precio pedido",
    searchBoard: "Buscar en el tablero",
    listPart: "Publicar esta pieza",
    writingListing: "Escribiendo el anuncio…",
    readyToPost: "Lista para publicar",
    adTitle: "Título",
    price: "Precio",
    pickup: "Recogida",
    pickupPh: "Pueblo, estado",
    listing: "Anuncio",
    postListing: "Publicar anuncio",
    reshoot: "Otra foto",
    onTheBoard: "En el tablero",
  },
  toast: {
    identifyFailed: "No se pudo identificar",
    choosePhoto: "Elige una foto de la pieza",
    couldNotRead: "No se pudo leer esa foto",
    couldNotLoadSample: "No se pudo cargar esa muestra",
    pickCategoryFirst: "Primero elige una categoría principal",
    racecarNeedsSurface: "Las piezas de auto de carrera necesitan Dirt, Asphalt u Offroad",
    couldNotWrite: "No se pudo escribir el anuncio",
    listingPosted: "El anuncio ya está en el tablero",
  },
  talk: {
    listening: "Escuchando",
    voice: "Descripción por voz",
    stop: "Detener descripción por voz",
    start: "Editar con descripción por voz",
    defaultHint:
      "Esto reemplaza la estimación de la foto. Habla claro y corrige la transcripción si el micrófono se equivoca.",
    unsupported:
      "La voz no está disponible en este navegador. Escribe año, máquina, condición, precio y pueblo abajo.",
    blocked: "Micrófono bloqueado. Escribe la descripción, o permite el micrófono.",
    noSpeech: "No se escuchó — sigue hablando, o escríbelo.",
    couldntHear: "No se escuchó bien. Escribe la descripción para que quede precisa.",
    paused: "Pausado. Toca de nuevo para agregar más.",
    checkTranscript: "Revisa la transcripción. Corrige lo que el micrófono omitió.",
    speakHint: "Di el año, la máquina, qué falla, el precio y el pueblo de recogida.",
    couldntStart: "No se pudo iniciar el micrófono. Escribe la descripción.",
    notAvailable: "La voz no está disponible aquí — escribe la descripción abajo.",
  },
  marketPage: {
    kicker: "Tablero de particulares",
    title: "Mercado",
    intro:
      "Busca piezas de ATV, camioneta, dirt bike, auto de carrera y moto de nieve. Las carreras se dividen en Dirt, Asphalt y Offroad. Tú publicas. El comprador te contacta. Sin comisión de escrow.",
    myAds: "Mis anuncios",
    searchPh: "Busca bandas, beadlocks, pinzas, skid plates…",
    searchAria: "Buscar piezas",
    identifyAria: "Identificar una pieza",
    mainCategory: "Categoría principal",
    racingDirtAsphalt: "Carreras — Dirt, Asphalt u Offroad",
    alsoOnBoard: "También en el tablero",
    all: "Todas",
    results: "Resultados",
    onTheBoard: "En el tablero",
    nothingMatches: "Nada coincide",
    emptyHint: "Prueba otra palabra, o identifica una pieza y busca desde la foto.",
  },
  aboutPage: {
    kicker: "rv-chain.com",
    title: "Acerca de RV Chain",
    p1: "RV Chain es un tablero de piezas de powersports — ATVs, camionetas off-road, dirt bikes, motos de nieve y autos de carrera en Dirt, Asphalt u Offroad. Identifica una pieza con una foto, luego búsca o publícala.",
    p2: "Identificar es la puerta de entrada: toma una foto, lee un resumen general, descríbela por voz, elige ATV / camioneta / dirt bike / auto de carrera (Dirt, Asphalt u Offroad) / moto de nieve, luego busca en el tablero o publícala.",
    p3: "El mercado es un tablero simple de piezas. Tú publicas. El comprador te contacta. Sin comisión de escrow. Sin concesionaria de vehículos.",
    li1: "Solo powersports — sin camping, sin campers, sin campamentos.",
    li2: "No somos un concesionario de vehículos.",
    li3: "No somos un intermediario que retiene tu dinero.",
    questions: "Preguntas: admin@rv-chain.com",
  },
  adsPage: {
    title: "Mis anuncios",
    intro: "Los anuncios que publicaste desde Identificar se quedan en este dispositivo.",
    empty: "Aún no hay anuncios",
    emptyHint: "Fotografía una pieza, descríbela por voz, elige una categoría y publícala.",
    remove: "Quitar",
  },
  listingPage: {
    notFound: "Anuncio no encontrado",
    loading: "Cargando",
    stale: "Puede que lo hayan bajado, o este enlace ya no sirve.",
    pulling: "Trayendo el anuncio…",
    backToMarket: "Volver al Mercado",
    yourAd: "Tu anuncio",
    yourAds: "Tus anuncios",
    identifySimilar: "Identificar una pieza similar",
    contactSeller: "Contactar al vendedor",
    inquiryCopied: "Consulta copiada — pégasela al vendedor",
    couldNotCopy: "No se pudo copiar",
    inquiryPrefix: "Me interesa tu anuncio en RV Chain:",
    pickupPrefix: "Recogida:",
    privateParty: "Particular. Sin escrow. Tú y el vendedor lo arreglan.",
    related: "Relacionados",
  },
  sponsors: "Patrocinadores",
  sponsorsPage: {
    kicker: "Patrocinadores de apoyo",
    title: "Patrocinadores",
  },
};

type Widen<T> = {
  [K in keyof T]: T[K] extends string ? string : Widen<T[K]>;
};

const COPY: Record<Locale, Widen<typeof EN>> = {
  en: EN,
  es: ES,
};

export type Copy = Widen<typeof EN>;

export function t(locale?: string | null): Copy {
  return locale === "es" ? COPY.es : COPY.en;
}

export function catLabel(locale: Locale, id: Category) {
  return t(locale).cat[id];
}

export function surfaceLabel(locale: Locale, id: RaceSurface) {
  return t(locale).surface[id];
}

export function condLabel(locale: Locale, id: Condition) {
  return t(locale).condition[id];
}

export function kindLabel(locale: Locale, listing: Pick<Listing, "category" | "raceSurface">) {
  const copy = t(locale);
  if (listing.category === "racecar" && listing.raceSurface) {
    return `${copy.cat.racecar} · ${copy.surface[listing.raceSurface]}`;
  }
  return copy.cat[listing.category] ?? copy.part;
}

export function sampleLabel(locale: Locale, id: string) {
  const map = t(locale).samples as Record<string, string>;
  return map[id] ?? id;
}
