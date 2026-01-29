import { supabase } from '../lib/supabase';
import * as Linking from 'expo-linking';

import { Platform } from 'react-native';

const WAHOO_CLIENT_ID = 'NNWFuabam7XbgUg4nAvQ1KQFXVaF4K1b2Zu_Yohbu2s';
// Client Secret moved to Supabase Edge Functions for security

// Auto-generate the correct redirect URI for Expo Go or Production
const REDIRECT_URI = process.env.EXPO_PUBLIC_WAHOO_REDIRECT_URI || Linking.createURL('wahoo-callback');
console.log("► WAHOO REDIRECT URI GENERATED:", REDIRECT_URI);

export const wahooService = {
    /**
     * Get the OAuth URL to start the connection flow.
     */
    getAuthUrl() {
        // Explicitly set state based on platform
        const state = Platform.OS === 'web' ? 'web' : 'mobile';

        // Wahoo standard OAuth URL
        const scope = 'user_read workouts_read workouts_write';
        return `https://api.wahooligan.com/oauth/authorize?client_id=${WAHOO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
    },

    /**
     * Exchange authorization code for tokens and save to DB.
     */
    async exchangeCode(code) {
        try {
            console.log("Exchanging code for tokens via Edge Function:", code);

            // Call Edge Function
            const { data, error } = await supabase.functions.invoke('wahoo-auth', {
                body: {
                    code,
                    redirect_uri: REDIRECT_URI
                }
            });

            if (error) {
                console.error("Edge Function Error:", error);
                throw error;
            }

            console.log("Tokens exchange success via Edge Function");
            return true;
        } catch (error) {
            console.error('Wahoo Auth Error:', error);
            throw error;
        }
    },

    /**
     * Check if user is connected to Wahoo.
     */
    async isConnected() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('wahoo_tokens')
            .select('expires_at')
            .eq('user_id', user.id)
            .single();

        if (error || !data) return false;

        // Simple check if token exists (could execute refresh here if expired)
        return true;
    },

    /**
     * Sync recent workouts from Wahoo.
     */
    async syncWorkouts() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Get token
        const { data: tokenData } = await supabase
            .from('wahoo_tokens')
            .select('access_token_enc')
            .eq('user_id', user.id)
            .single();

        if (!tokenData) throw new Error('Not connected to Wahoo');

        // 2. Fetch from Wahoo API (Mocked for MVP until real creds)
        // Simulate fetching last 7 days of history
        const mockActivities = [];
        const today = new Date();

        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i - 1); // Days in the past

            mockActivities.push({
                id: `wahoo_hist_${i}_` + date.getTime(),
                name: i % 2 === 0 ? 'Entreno Aeróbico' : 'Salida en Bici',
                type: i % 2 === 0 ? 'running' : 'cycling',
                start_time: date.toISOString(),
                duration: 3600 + (i * 300), // Variable duration
                distance: 10000 + (i * 2000),
                average_heartrate: 135 + i,
                average_power: 150 + (i * 10)
            });
        }

        // 3. Upsert to `workouts` table with deduplication
        for (const act of mockActivities) {
            const { error: upsertError } = await supabase.from('workouts').upsert({
                user_id: user.id,
                provider: 'wahoo',
                provider_activity_id: act.id, // Fixed: match DB column
                sport: act.type === 'cycling' ? 'ciclismo' : 'running',
                title: act.name,
                start_dt: act.start_time,
                duration_s: act.duration,
                summary_json: {
                    distance_m: act.distance,
                    avg_hr: act.average_heartrate,
                    avg_power: act.average_power,
                    ...act // Store full raw payload as well if needed
                }
            }, {
                onConflict: 'user_id,provider,provider_activity_id' // Fixed: match DB constraint
            });

            if (upsertError) {
                console.error("Supabase Upsert Error:", upsertError);
                throw upsertError; // Re-throw to be caught by handleSync
            }
        }

        return mockActivities.length;
    }
};
