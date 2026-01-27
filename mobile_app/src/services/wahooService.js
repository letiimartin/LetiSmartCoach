import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';

const WAHOO_CLIENT_ID = 'YOUR_WAHOO_CLIENT_ID'; // TODO: Move to env
const WAHOO_CLIENT_SECRET = 'YOUR_WAHOO_CLIENT_SECRET'; // TODO: Move to env
const REDIRECT_URI = 'letismartcoach://wahoo-callback';

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
            // In a real app, this should be done via a backend proxy to keep Client Secret hidden.
            // For MVP local dev, we do it here or assume a Supabase Edge Function exists.
            // We'll simulate the token response for now if we can't hit Wahoo directly without credentials.

            // Mock response for development if no real creds
            const tokens = {
                access_token: 'mock_access_token_' + Date.now(),
                refresh_token: 'mock_refresh_token_' + Date.now(),
                expires_in: 7200,
                scope: 'user_read workouts_read'
            };

            // Calculate expiry
            const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user logged in');

            // Save to DB using the existing schema structure (with _enc suffix)
            const { error } = await supabase.from('wahoo_tokens').upsert({
                user_id: user.id,
                access_token_enc: tokens.access_token, // Ideally encrypt before sending
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
        const mockActivities = [
            {
                id: 'wahoo_123_' + Date.now(),
                name: 'Morning Ride',
                type: 'cycling',
                start_time: new Date().toISOString(),
                duration: 3600, // 1h
                distance: 25000, // 25km
                average_heartrate: 145,
                average_power: 180
            }
        ];

        // 3. Upsert to `workouts` table with deduplication
        for (const act of mockActivities) {
            await supabase.from('workouts').upsert({
                user_id: user.id,
                provider: 'wahoo',
                provider_activity_id: act.id, // Maps to external_id in plan, but existing schema uses this
                sport: act.type === 'cycling' ? 'ciclismo' : 'running', // Simple map
                title: act.name,
                start_dt: act.start_time,
                duration_s: act.duration,
                distance_m: act.distance,
                avg_hr: act.average_heartrate,
                avg_power: act.average_power,
                metrics_json: act // Store full raw payload
            }, {
                onConflict: 'user_id, provider, provider_activity_id'
            });
        }

        return mockActivities.length;
    }
};
