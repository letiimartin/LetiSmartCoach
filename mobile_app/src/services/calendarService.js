import { MOCK_EVENTS } from '../data/mocks';

export const calendarService = {
    async getEvents() {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_EVENTS), 300);
        });
    },

    async addEvent(event) {
        console.log('Add event (Mock):', event);
        return new Promise((resolve) => {
            setTimeout(() => resolve({ ...event, id: Date.now() }), 300);
        });
    },

    async getWorkouts() {
        return new Promise((resolve) => {
            const workouts = MOCK_EVENTS.filter(e => e.type === 'workout');
            setTimeout(() => resolve(workouts), 300);
        });
    },

    async getWeeklySummary(startDate) {
        // Mocking summary stats
        return new Promise((resolve) => {
            setTimeout(() => resolve({
                sessions: 5,
                hours: "8h 30m",
                tss: 420,
                restrictions: 2,
                keyRace: "Domingo: Carrera A"
            }), 300);
        });
    }
};
