import { supabase } from '../lib/supabase';

export const profileService = {
    async getProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No hay sesión activa");

            // Fetch from both tables (Split Source of Truth)
            const [profileRes, athleteRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('athlete_profile').select('*').eq('user_id', user.id).single()
            ]);

            if (profileRes.error && profileRes.error.code !== 'PGRST116') throw profileRes.error;

            // Fallback: If athlete_profile doesn't exist, it might be an older user
            let athleteData = athleteRes.data;
            if (athleteRes.error && athleteRes.error.code === 'PGRST116') {
                const { data: newbie, error: insertError } = await supabase
                    .from('athlete_profile')
                    .insert([{ user_id: user.id }])
                    .select()
                    .single();
                if (insertError) throw insertError;
                athleteData = newbie;
            } else if (athleteRes.error) {
                throw athleteRes.error;
            }

            return this._mapProfile(profileRes.data, athleteData, user);
        } catch (error) {
            console.error("Error in getProfile:", error);
            throw error;
        }
    },

    async updateProfile(updates) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No hay sesión activa");

            // Split updates into identity and performance payloads
            const identityFields = ['full_name', 'age', 'gender', 'height_cm', 'weight_kg'];
            const performanceFields = ['sport_focus', 'ftp_w', 'vo2max', 'thresholds_json', 'zones_power_json', 'zones_hr_json'];

            const identityPayload = {};
            const performancePayload = {};
            const settingsPayload = {};

            Object.keys(updates).forEach(key => {
                const val = updates[key];
                if (identityFields.includes(key)) {
                    if (['age', 'height_cm'].includes(key)) identityPayload[key] = val ? parseInt(val) : null;
                    else if (key === 'weight_kg') identityPayload[key] = val ? parseFloat(val) : null;
                    else identityPayload[key] = val;
                } else if (performanceFields.includes(key)) {
                    if (key === 'ftp_w') performancePayload[key] = val ? parseInt(val) : null;
                    else if (key === 'vo2max') performancePayload[key] = val ? parseFloat(val) : null;
                    else if (key.endsWith('_json') && typeof val === 'object' && val !== null) {
                        // Ensure nested numeric values are actually numbers
                        const sanitized = {};
                        Object.entries(val).forEach(([k, v]) => {
                            sanitized[k] = (v === '' || v === null) ? null : (isNaN(v) ? v : parseFloat(v));
                        });
                        performancePayload[key] = sanitized;
                    }
                    else performancePayload[key] = val;
                } else if (!['id', 'user_id', 'created_at', 'updated_at', 'email', 'avatar'].includes(key)) {
                    settingsPayload[key] = val;
                }
            });

            // Identity Update
            const profilePromise = supabase
                .from('profiles')
                .update(identityPayload)
                .eq('id', user.id)
                .select()
                .single();

            // Performance Update (with settings)
            const athletePromise = supabase
                .from('athlete_profile')
                .update({ ...performancePayload, settings: settingsPayload })
                .eq('user_id', user.id)
                .select()
                .single();

            const [pRes, aRes] = await Promise.all([profilePromise, athletePromise]);

            if (pRes.error) throw pRes.error;
            if (aRes.error) throw aRes.error;

            return this._mapProfile(pRes.data, aRes.data, user);
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    },

    _mapProfile(profile, athlete, user) {
        if (!profile) return null;
        return {
            ...profile,
            ...athlete, // Athlete fields overwrite / complement
            ...athlete?.settings, // Flatten settings
            email: user?.email,
            avatar: profile.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'
        };
    }
};
