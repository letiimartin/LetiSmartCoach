export const MOCK_ATHLETE = {
    name: "Leti Martín",
    avatar: "LM",
    sport_focus: "Ciclismo & Trail Running",
    // 2. Información general
    age: 24,
    gender: "Femenino",
    height_cm: 165,
    weight_kg: 60,
    occupation: "Diseñadora UX / Desarrolladora",
    // 3. Perfil deportivo
    level: "Competitivo (Amateur)",
    profile_type: "Escaladora / Diesel",
    ftp_w: 235,
    running_pace: "4:15 min/km",
    zones: {
        power: ["Z1: <130W", "Z2: 130-175W", "Z3: 176-210W", "Z4: 211-245W", "Z5: >245W"],
        hr: ["Z1: <140", "Z2: 140-155", "Z3: 156-168", "Z4: 169-180", "Z5: >181"]
    },
    // 4. Preferencias y motivación
    motivation: "Competición y superación personal",
    motivators: "Ver progreso en los vatios y completar retos exigentes",
    fav_races: "Carreras de montaña técnicas y puertos largos de carretera",
    fav_workouts: "Series en subida (SST) y tiradas largas en Z2 por naturaleza",
    // 5. Contexto vital
    schedule: "Mañanas (antes del trabajo)",
    stress: null,
    social_life: "Sí, activa los fines de semana",
    free_time: "",
    weekly_tss: 450,
    next_race_days: 15,
};

export const MOCK_WORKOUTS = [
    { id: 1, title: "Umbral - 3x10min", sport: "Cycling", duration: "1h 15m", intensity: "High", date: "2026-01-23" },
    { id: 2, title: "Z2 Base Ride", sport: "Cycling", duration: "2h 00m", intensity: "Moderate", date: "2026-01-24" },
    { id: 3, title: "Trail Recovery", sport: "Running", duration: "45m", intensity: "Low", date: "2026-01-25" },
];

export const MOCK_EVENTS = [
    {
        id: 1,
        title: "Gran Fondo Pirineos",
        date: "2026-02-15",
        type: "race",
        priority: "A",
        time: "08:00",
        details: "Objetivo principal de la temporada."
    },
    {
        id: 2,
        title: "Cena de equipo",
        date: "2026-01-23",
        type: "social",
        impact: "No entreno",
        time: "21:00"
    },
    {
        id: 3,
        title: "Ciclo Menstrual",
        date: "2026-01-20",
        endDate: "2026-01-22",
        type: "health",
        subType: "Ciclo",
        restriction: "Sin intensidad"
    },
    {
        id: 4,
        title: "Viaje de trabajo",
        date: "2026-01-25",
        endDate: "2026-01-26",
        type: "health",
        subType: "Viaje",
        restriction: "Solo Z1"
    },
    {
        id: 5,
        title: "Molestia Tendón",
        date: "2026-01-24",
        type: "health",
        subType: "Lesión",
        restriction: "No correr"
    }
];
