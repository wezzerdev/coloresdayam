import tinycolor from 'tinycolor2';

// Clave para guardar preferencias locales en el navegador
const STORAGE_KEY = 'coloresdayam_user_taste_v1';

/**
 * Carga el perfil de gusto estético del usuario desde localStorage.
 */
export const getUserTasteProfile = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) return JSON.parse(data);
    } catch (e) {
        console.warn('No se pudo leer el perfil de gustos:', e);
    }
    return {
        hues: [], // Colección de tonos HSL (0-360) que le gustan al usuario
        avgSaturation: 60,
        avgLightness: 50,
        totalInteractions: 0
    };
};

/**
 * Guarda y actualiza el perfil con un nuevo color que al usuario le gustó
 * (al bloquear un color, guardar una paleta o elegir color de marca).
 */
export const recordColorPreference = (hex) => {
    if (!hex || !tinycolor(hex).isValid()) return;
    const color = tinycolor(hex);
    const hsl = color.toHsl();
    const profile = getUserTasteProfile();

    profile.hues.push(Math.round(hsl.h));
    if (profile.hues.length > 50) {
        profile.hues.shift(); // Mantener los últimos 50 colores
    }

    // Recalcular promedios
    const count = profile.hues.length;
    profile.avgSaturation = Math.round((profile.avgSaturation * (count - 1) + hsl.s * 100) / count);
    profile.avgLightness = Math.round((profile.avgLightness * (count - 1) + hsl.l * 100) / count);
    profile.totalInteractions++;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
        console.warn('Error al guardar gusto estético:', e);
    }
};

/**
 * Retorna un tono de color (Hue 0-360) optimizado para el usuario.
 * Con 60% de probabilidad genera armonía cerca de sus tonos favoritos,
 * y con 40% explora nuevos tonos espectaculares (Golden Ratio step).
 */
export const getTunedBaseHue = () => {
    const profile = getUserTasteProfile();

    if (profile.hues.length >= 3 && Math.random() < 0.65) {
        // Tomar un tono favorito reciente y aplicarle una variación armónica (±15° a ±30°)
        const favoriteHue = profile.hues[Math.floor(Math.random() * profile.hues.length)];
        const variation = (Math.random() - 0.5) * 45;
        return (favoriteHue + variation + 360) % 360;
    }

    // Exploración armónica utilizando la Razón Áurea (Golden Ratio: ~137.5°)
    const goldenAngle = 137.508;
    const seed = Math.random() * 360;
    return (seed + goldenAngle) % 360;
};

/**
 * Genera un Nombre Poético y Elegante para cualquier paleta de 5 colores.
 */
export const generatePoeticPaletteName = (colors = []) => {
    if (!colors || colors.length === 0) return "Paleta Armónica";

    const parsedColors = colors.map(c => tinycolor(c));
    const mainColor = parsedColors[0] || tinycolor('#4F46E5');
    const hsl = mainColor.toHsl();

    const hue = hsl.h;
    const s = hsl.s;
    const l = hsl.l;

    // Clasificación por tono y vibra
    let prefijo = "";
    let sufijo = "";

    // Prefijos por luminosidad y saturación
    if (l > 0.8) {
        prefijo = ["Brisa", "Sueño", "Seda", "Lino", "Espuma", "Nube", "Algodón"][Math.floor(Math.random() * 7)];
    } else if (l < 0.25) {
        prefijo = ["Abismo", "Noche", "Sombra", "Eclipse", "Cosmos", "Medianoche", "Obsidiana"][Math.floor(Math.random() * 7)];
    } else if (s > 0.75) {
        prefijo = ["Neón", "Destello", "Vibra", "Fuego", "Explosión", "Prisma", "Relámpago"][Math.floor(Math.random() * 7)];
    } else {
        prefijo = ["Armonía", "Esencia", "Aura", "Sinfonía", "Matiz", "Reflejo", "Suspiro"][Math.floor(Math.random() * 7)];
    }

    // Sufijos por rango cromático (Hue)
    if (hue >= 340 || hue < 15) { // Rojos
        sufijo = ["Carmesí", "Granate", "Fuego", "Rubí", "Coral", "Escarlata"][Math.floor(Math.random() * 6)];
    } else if (hue >= 15 && hue < 45) { // Naranjas
        sufijo = ["Atardecer", "Ámbar", "Terracota", "Calidez", "Mandarina", "Solsticio"][Math.floor(Math.random() * 6)];
    } else if (hue >= 45 && hue < 70) { // Amarillos
        sufijo = ["Dorado", "Sol de Verano", "Miel", "Arena", "Mostaza", "Luz Solar"][Math.floor(Math.random() * 6)];
    } else if (hue >= 70 && hue < 165) { // Verdes
        sufijo = ["Esmeralda", "Selva", "Botánico", "Menta", "Jade", "Bosque"][Math.floor(Math.random() * 6)];
    } else if (hue >= 165 && hue < 260) { // Azules y Cyan
        sufijo = ["Océano", "Turquesa", "Ártico", "Zafiro", "Celeste", "Marea"][Math.floor(Math.random() * 6)];
    } else if (hue >= 260 && hue < 315) { // Violetas
        sufijo = ["Violeta", "Místico", "Nebulosa", "Amatista", "Lavanda", "Glicina"][Math.floor(Math.random() * 6)];
    } else { // Rosas / Magentas
        sufijo = ["Orquídea", "Cerezos", "Pastel", "Magnesio", "Magenta", "Rosa Silvestre"][Math.floor(Math.random() * 6)];
    }

    return `${prefijo} ${sufijo}`;
};
