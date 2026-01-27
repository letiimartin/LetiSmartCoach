import { supabase } from '../lib/supabase';

export const calendarService = {
    /**
     * Fetch both calendar events and planned sessions (workouts) for the user.
     */
    async getEvents() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No hay sesión activa");

            // Fetch generic events and planned sessions in parallel
            const [eventsRes, sessionsRes] = await Promise.all([
                supabase
                    .from('calendar_events')
                    .select('*')
                    .eq('user_id', user.id),
                supabase
                    .from('planned_sessions')
                    .select('*')
                    .eq('user_id', user.id)
            ]);

            if (eventsRes.error) throw eventsRes.error;
            if (sessionsRes.error) throw sessionsRes.error;

            // Map generic events
            const mappedEvents = eventsRes.data.map(e => ({
                id: e.id,
                title: e.title,
                date: e.start_dt.split('T')[0],
                start_dt: e.start_dt,
                end_dt: e.end_dt,
                type: e.type, // 'race', 'social', 'health', 'personal'
                description: e.details_json?.description || '',
                priority: e.priority || 'medium'
            }));

            // Map planned sessions to 'workout' type for the calendar
            const mappedWorkouts = sessionsRes.data.map(s => ({
                id: s.id,
                title: `${s.sport.toUpperCase()}: ${s.targets_json?.main_goal || 'Sesión'}`,
                date: s.date,
                type: 'workout',
                sport: s.sport,
                duration: s.duration_s ? `${Math.round(s.duration_s / 60)} min` : '--',
                description: s.structure_json?.notes || '',
                status: s.export_status // pending, exporting, exported, failed
            }));

            return [...mappedEvents, ...mappedWorkouts];
        } catch (error) {
            console.error("Error fetching calendar:", error);
            throw error;
        }
    },

    /**
     * Add a new generic calendar event.
     */
    async addEvent(event) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No hay sesión activa");

            const { data, error } = await supabase
                .from('calendar_events')
                .insert([{
                    user_id: user.id,
                    type: event.type,
                    title: event.title,
                    start_dt: event.start_dt || new Date().toISOString(),
                    details_json: { description: event.description }
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error adding event:", error);
            throw error;
        }
    },

    /**
     * Update an existing generic event.
     */
    async updateEvent(id, updates) {
        try {
            const { data, error } = await supabase
                .from('calendar_events')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error updating event:", error);
            throw error;
        }
    },

    /**
     * Delete an event.
     */
    async deleteEvent(id) {
        try {
            const { error } = await supabase
                .from('calendar_events')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error deleting event:", error);
            throw error;
        }
    },

    /**
     * Update the status of a planned session (workout).
     */
    async updateStatus(id, status) {
        try {
            const { error } = await supabase
                .from('planned_sessions')
                .update({ export_status: status }) // MVP uses export_status for the UI badge
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error updating status:", error);
            throw error;
        }
    },

    /**
     * Placeholder for weekly summary.
     */
    async getWeeklySummary(startDate) {
        return {
            sessions: 0,
            hours: "0h",
            tss: 0,
            restrictions: 0,
            keyRace: "No racing info"
        };
    }
};
