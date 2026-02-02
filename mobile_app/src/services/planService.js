import { supabase } from '../lib/supabase';

export const planService = {
    /**
     * Calls the 'generate-training-plan' Edge Function
     * @param {string} weekStart - ISO date string (YYYY-MM-DD)
     * @returns {Promise<Object>} - The generated plan
     */
    async generatePlan(weekStart) {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("DEBUG: Generating Plan for", weekStart);
        console.log("DEBUG: Access Token present:", !!session?.access_token);

        const { data, error } = await supabase.functions.invoke('generate-training-plan', {
            body: { week_start: weekStart }
        });

        if (error) throw error;
        return data;
    },

    /**
     * Calls the 'chat-coach' Edge Function
     * @param {string} message - User message
     * @returns {Promise<Object>} - The coach response
     */
    async chatWithCoach(message) {
        const { data, error } = await supabase.functions.invoke('chat-coach', {
            body: { message }
        });

        if (error) throw error;
        return data;
    },

    /**
     * Fetches chat history from the database
     * @returns {Promise<Array>} - List of messages
     */
    async getCoachMessages() {
        const { data, error } = await supabase
            .from('coach_messages')
            .select('*')
            .order('created_at', { ascending: true }); // Oldest first for chat UI

        if (error) throw error;
        return data;
    }
};
