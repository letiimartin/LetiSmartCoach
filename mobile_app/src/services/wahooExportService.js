import { supabase } from '../lib/supabase';

export const wahooExportService = {
    /**
     * Export a planned session to Wahoo Cloud API.
     */
    async exportPlannedSession(plannedSessionId) {
        try {
            console.log(`[WahooExport] Starting export for session ${plannedSessionId}`);

            // 1. Get session data
            const { data: session, error: sessionError } = await supabase
                .from('planned_sessions')
                .select('*')
                .eq('id', plannedSessionId)
                .single();

            if (sessionError || !session) {
                throw new Error("No se pudo cargar la sesión planificada.");
            }

            // Update status to 'exporting'
            await supabase.from('planned_sessions').update({
                export_status: 'exporting',
                export_last_error: null
            }).eq('id', plannedSessionId);

            // 2. Get user token
            const { data: { user } } = await supabase.auth.getUser();
            const { data: tokenData, error: tokenError } = await supabase
                .from('wahoo_tokens')
                .select('access_token_enc, scope')
                .eq('user_id', user.id)
                .single();

            if (tokenError || !tokenData) {
                throw new Error("No estás conectado a Wahoo.");
            }

            // Check for required scope
            if (!tokenData.scope?.includes('plans_write')) {
                const scopeError = new Error("Falta permiso 'plans_write' en Wahoo.");
                scopeError.code = 'MISSING_SCOPE';
                throw scopeError;
            }

            // 3. Get athlete profile for FTP
            const { data: profile } = await supabase
                .from('athlete_profile')
                .select('ftp_w')
                .eq('user_id', user.id)
                .single();

            const ftp = profile?.ftp_w || 200; // Fallback to 200 if not set

            // 4. Build Wahoo Plan JSON
            const planJson = this.buildWahooPlan(session, ftp);
            const base64Plan = this.encodeBase64(JSON.stringify(planJson));

            // 5. Create Plan in Wahoo
            console.log("[WahooExport] Creating Plan...");
            const planResponse = await fetch('https://api.wahooligan.com/v1/plans', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token_enc}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'plan[file]': `data:application/json;base64,${base64Plan}`
                })
            });

            if (!planResponse.ok) {
                const errorData = await planResponse.json();
                console.error("[WahooExport] Plan Error:", errorData);
                throw new Error(errorData.error || `Error creating plan: ${planResponse.status}`);
            }

            const planResult = await planResponse.json();
            const wahooPlanId = planResult.id;
            console.log(`[WahooExport] Plan created with ID: ${wahooPlanId}`);

            // 6. Create Workout in Wahoo
            console.log("[WahooExport] Creating Workout...");
            // Map LetiSmartCoach sport to Wahoo workout_type_id
            // Cycling -> 0, Running -> 1
            const workoutTypeId = session.sport?.toLowerCase() === 'running' ? 1 : 0;

            // Format date to Wahoo day_code (days since 2020-01-01, where 2020-01-01 is 1)
            const dayCode = this.toWahooDayCode(session.date);

            const workoutResponse = await fetch('https://api.wahooligan.com/v1/workouts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token_enc}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'workout[name]': planJson.name, // Use generated title
                    'workout[workout_token]': `leti_${session.id}`,
                    'workout[workout_type_id]': workoutTypeId.toString(),
                    'workout[minutes]': Math.round((session.duration_s || 3600) / 60).toString(),
                    'workout[day_code]': dayCode.toString(),
                    'workout[plan_id]': wahooPlanId.toString()
                })
            });

            if (!workoutResponse.ok) {
                const errorData = await workoutResponse.json();
                console.error("[WahooExport] Workout Error:", errorData);
                throw new Error(errorData.error || `Error creating workout: ${workoutResponse.status}`);
            }

            const workoutResult = await workoutResponse.json();
            console.log(`[WahooExport] Workout created successfully: ${workoutResult.id}`);

            // 7. Update DB with success
            await supabase.from('planned_sessions').update({
                export_status: 'exported',
                exported_at: new Date().toISOString(),
                export_refs: {
                    wahoo_plan_id: wahooPlanId,
                    wahoo_workout_id: workoutResult.id
                }
            }).eq('id', plannedSessionId);

            return true;

        } catch (error) {
            console.error("[WahooExport] Fatal Error:", error);

            // Update DB with error
            await supabase.from('planned_sessions').update({
                export_status: 'failed',
                export_last_error: error.message
            }).eq('id', plannedSessionId);

            throw error;
        }
    },

    /**
     * Calculates Wahoo day_code: days since 2020-01-01 (day 1).
     * @param {string} dateStr - Date in YYYY-MM-DD format.
     */
    toWahooDayCode(dateStr) {
        const targetDate = new Date(dateStr);
        const startDate = new Date('2020-01-01');

        // Reset hours to ensure clean day calculation
        targetDate.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(targetDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays + 1;
    },

    /**
     * RN-compatible Base64 encoding.
     * Uses a simple JS implementation to avoid browser-only btoa.
     */
    encodeBase64(str) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let output = '';
        for (let block = 0, charCode, i = 0, map = chars;
            str.charAt(i | 0) || (map = '=', i % 1);
            output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
            charCode = str.charCodeAt(i += 3 / 4);
            if (charCode > 0xFF) throw new Error("'encodeBase64' failed: The string to be encoded contains characters outside of the Latin1 range.");
            block = block << 8 | charCode;
        }
        return output;
    },

    /**
     * Maps internal structure_json to Wahoo Plan JSON format.
     */
    buildWahooPlan(session, ftp) {
        // Generate title if missing (matches calendar UI logic)
        const title = session.title || `${session.sport.toUpperCase()}: ${session.targets_json?.main_goal || 'Sesión'}`;

        // Collect all notes from intervals for description
        const description = session.description || (session.structure_json || []).map(s => s.notes).filter(n => !!n).join('. ') || "";

        const intervals = (session.structure_json || []).map(step => {
            const targets = [];

            // Map target_type (Zone, Power, etc.) to Wahoo format
            if (step.target_type === 'Power' || (step.target_max && typeof step.target_max === 'number')) {
                targets.push({
                    type: 'power',
                    low: (step.target_min || 0) / ftp,
                    high: (step.target_max || step.target_min || 0) / ftp
                });
            } else if (step.target_type === 'Zone' || typeof step.target_max === 'string') {
                const zones = {
                    'Z1': [0, 0.55],
                    'Z2': [0.56, 0.75],
                    'Z3': [0.76, 0.90],
                    'Z4': [0.91, 1.05],
                    'Z5': [1.06, 1.20]
                };
                const range = zones[step.target_max] || zones['Z2'];
                targets.push({
                    type: 'power',
                    low: range[0],
                    high: range[1]
                });
            }

            return {
                name: step.type || 'Interval',
                duration: step.duration_s || 60,
                targets: targets
            };
        });

        return {
            name: title,
            description: description,
            ftp: ftp,
            intervals: intervals
        };
    }
};
