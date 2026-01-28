import { supabase } from '../lib/supabase';
import * as Linking from 'expo-linking';

const WAHOO_CLIENT_ID = 'NNWFuabam7XbgUg4nAvQ1KQFXVaF4K1b2Zu_Yohbu2s';
const WAHOO_CLIENT_SECRET = '7dYRrjvF6xJDsmHE6BjKK_S-_E8PKzQik95bSKqCM20';

// Auto-generate the correct redirect URI for Expo Go or Production
const REDIRECT_URI = Linking.createURL('wahoo-callback');
console.log("► WAHOO REDIRECT URI GENERATED:", REDIRECT_URI);

export const wahooService = {
    /**
     * Get the OAuth URL to start the connection flow.
     */
    getAuthUrl() {
        // Wahoo standard OAuth URL
        const scope = 'user_read workouts_read workouts_write';
        return `https://api.wahooligan.com/oauth/authorize?client_id=${WAHOO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    },

    /**
     * Exchange authorization code for tokens and save to DB.
     */
    async exchangeCode(code) {
        try {
            console.log("Exchanging code for tokens:", code);

            // Real Wahoo Token Exchange
            const response = await fetch('https://api.wahooligan.com/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: WAHOO_CLIENT_ID,
                    client_secret: WAHOO_CLIENT_SECRET,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: REDIRECT_URI
                }).toString()
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Wahoo Token Error: ${response.status} ${errorText}`);
            }

            const tokens = await response.json();
            console.log("Tokens received:", tokens);

            // Calculate expiry
            // Wahoo usually returns expires_in (seconds)
            const expiresAt = new Date(Date.now() + (tokens.expires_in || 7200) * 1000).toISOString();

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user logged in');

            // Save to DB
            const { error } = await supabase.from('wahoo_tokens').upsert({
                user_id: user.id,
                access_token_enc: tokens.access_token,
                refresh_token_enc: tokens.refresh_token,
                expires_at: expiresAt,
                scope: tokens.scope,
                updated_at: new Date().toISOString()
            });

            if (error) throw error;
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
            await supabase.from('workouts').upsert({
                user_id: user.id,
                provider: 'wahoo',
                external_id: act.id,
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
                onConflict: 'user_id, provider, external_id'
            });
        }

        return mockActivities.length;
    }
};
