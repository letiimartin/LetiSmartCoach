import { supabase } from '../lib/supabase';
import * as Linking from 'expo-linking';
import { wahooExportService } from './wahooExportService';

const WAHOO_CLIENT_ID = 'NNWFuabam7XbgUg4nAvQ1KQFXVaF4K1b2Zu_Yohbu2s';
// Client Secret moved to Supabase Edge Functions for security

// Auto-generate the correct redirect URI for Expo Go or Production
const REDIRECT_URI = Linking.createURL('wahoo-callback');
console.log("► WAHOO REDIRECT URI GENERATED:", REDIRECT_URI);

export const wahooService = {
    /**
     * Get the OAuth URL to start the connection flow.
     */
    getAuthUrl() {
        // Wahoo standard OAuth URL
        const scope = 'user_read workouts_read workouts_write plans_write';
        return `https://api.wahooligan.com/oauth/authorize?client_id=${WAHOO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}`;
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
        if (!user) throw new Error('Usuario no autenticado');

        // 1. Get token
        const { data: tokenData, error: tokenError } = await supabase
            .from('wahoo_tokens')
            .select('access_token_enc')
            .eq('user_id', user.id)
            .maybeSingle();

        if (tokenError || !tokenData || !tokenData.access_token_enc) {
            throw new Error('No estás conectado a Wahoo o el token es inválido. Por favor, vuelve a conectar tu cuenta.');
        }

        const accessToken = tokenData.access_token_enc;

        // 2. Fetch from Wahoo API
        console.log("► Fetching real workouts from Wahoo...");
        const response = await fetch('https://api.wahooligan.com/v1/workouts', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Error de autorización con Wahoo. Por favor, vuelve a conectar tu cuenta.');
            }
            throw new Error(`Error de Wahoo API: ${response.status}`);
        }

        const data = await response.json();
        const workouts = data.workouts || []; // Response has a 'workouts' array
        console.log(`► Found ${workouts.length} workouts in Wahoo`);

        // 3. Upsert to `workouts` table with deduplication
        let syncedCount = 0;
        const bikingIds = [0, 11, 12, 13, 14, 15, 16, 49, 61];

        for (const workout of workouts) {
            // Mapping details as requested:
            // - 1 = running
            // - [0, 11-16, 49, 61] = ciclismo
            let sport = 'other';
            if (workout.workout_type_id === 1) {
                sport = 'running';
            } else if (bikingIds.includes(workout.workout_type_id)) {
                sport = 'ciclismo';
            }

            const { error: upsertError } = await supabase.from('workouts').upsert({
                user_id: user.id,
                provider: 'wahoo',
                provider_activity_id: String(workout.id),
                sport: sport,
                title: workout.name || 'Entreno de Wahoo',
                start_dt: workout.starts,
                duration_s: (workout.minutes || 0) * 60,
                summary_json: {
                    ...workout // Store full raw payload
                }
            }, {
                onConflict: 'user_id,provider,provider_activity_id'
            });

            if (upsertError) {
                console.error(`❌ Error upserting workout ${workout.id}:`, upsertError);
            } else {
                syncedCount++;
            }
        }

        return syncedCount;
    },

    /**
     * Export a planned session.
     */
    async exportPlannedSession(plannedSessionId) {
        return wahooExportService.exportPlannedSession(plannedSessionId);
    }
};
