export const MOCK_ATHLETE = {
    name: "Leti Martín",
    avatar: "LM",
    sport_focus: "Ciclismo & Trail Running",
    age: 24,
    gender: "Femenino",
    height_cm: 165,
    weight_kg: 60,
    occupation: "Diseñadora UX / Desarrolladora",
    level: "Competitivo (Amateur)",
    profile_type: "Escaladora / Diesel",
    ftp_w: 235,
    running_pace: "4:15 min/km",
    zones: {
        power: ["Z1: <130W", "Z2: 130-175W", "Z3: 176-210W", "Z4: 211-245W", "Z5: >245W"],
        hr: ["Z1: <140", "Z2: 140-155", "Z3: 156-168", "Z4: 169-180", "Z5: >181"]
    },
    weekly_tss: 450,
    next_race_days: 15,
};

export const MOCK_EVENTS = [
    {
        id: 'w1',
        type: 'workout',
        title: "RODAJE Z2",
        sport: "ciclismo",
        date: "2026-01-19",
        duration: "1h 30m",
        zone: "Z2",
        intensity: "baja",
        tss: 65,
        status: "hecho",
        description: "Rodaje suave para asentar base aeróbica."
    },
    {
        id: 'w2',
        type: 'workout',
        title: "UMBRAL 3x10'",
        sport: "ciclismo",
        date: "2026-01-20",
        duration: "1h 15m",
        zone: "Z4",
        intensity: "moderada",
        tss: 85,
        status: "hecho",
        description: "Series a umbral funcional (95-100% FTP)."
    },
    {
        id: 'e1',
        id_type: 'health',
        type: 'health',
        title: "Ciclo Menstrual",
        date: "2026-01-20",
        endDate: "2026-01-22",
        subType: "Ciclo",
        restriction: "Sin intensidad"
    },
    {
        id: 'w3',
        type: 'workout',
        title: "TRAIL RECOVERY",
        sport: "running",
        date: "2026-01-21",
        duration: "45m",
        zone: "Z1",
        intensity: "baja",
        tss: 40,
        status: "saltado",
        description: "Rodaje muuuuy suave por terreno llano."
    },
    {
        id: 'w4',
        type: 'workout',
        title: "VO2 MAX 5x3'",
        sport: "running",
        date: "2026-01-22", // Hoy en el contexto mock
        duration: "1h 00m",
        zone: "Z5",
        intensity: "alta",
        tss: 95,
        status: "planificado",
        description: "Intervalos cortos a máxima capacidad aeróbica."
    },
    {
        id: 'e2',
        type: 'social',
        title: "Cena de equipo",
        date: "2026-01-23",
        time: "21:00",
        impact: "No entreno"
    },
    {
        id: 'w5',
        type: 'workout',
        title: "SST (Sweet Spot)",
        sport: "ciclismo",
        date: "2026-01-24",
        duration: "1h 45m",
        zone: "Z3/Z4",
        intensity: "moderada",
        tss: 110,
        status: "planificado",
        description: "Trabajo justo por debajo del umbral."
    },
    {
        id: 'e3',
        type: 'health',
        title: "Molestia Tendón",
        date: "2026-01-24",
        subType: "Lesión",
        restriction: "No correr"
    },
    {
        id: 'w6',
        type: 'workout',
        title: "TIRADA LARGA",
        sport: "running",
        date: "2026-01-25",
        duration: "2h 30m",
        zone: "Z2",
        intensity: "baja",
        tss: 150,
        status: "planificado",
        description: "Volumen aeróbico en montaña."
    },
    {
        id: 'r1',
        type: 'race',
        title: "Gran Fondo Pirineos",
        date: "2026-02-15",
        priority: "A",
        time: "08:00",
        details: "Objetivo principal A."
    }
];
