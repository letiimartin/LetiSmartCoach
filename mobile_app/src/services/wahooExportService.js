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
            const base64Plan = btoa(JSON.stringify(planJson));

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
            // 1: Cycling/Bike, 2: Running, etc. (Wahoo specific)
            const workoutTypeId = session.sport?.toLowerCase() === 'running' ? 2 : 1;

            // Format date to day_code (YYYYMMDD)
            const dayCode = session.date.replace(/-/g, '');

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
                    'workout[day_code]': dayCode,
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
            // Wahoo uses relative power (0.0 to 1.0 of FTP if relative)
            if (step.target_type === 'Power' || (step.target_max && typeof step.target_max === 'number')) {
                targets.push({
                    type: 'power',
                    low: (step.target_min || 0) / ftp,
                    high: (step.target_max || step.target_min || 0) / ftp
                });
            } else if (step.target_type === 'Zone' || typeof step.target_max === 'string') {
                // Simplistic zone mapping for MVP
                // Z1: 0-55%, Z2: 56-75%, Z3: 76-90%, Z4: 91-105%, Z5: >106%
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

        // Wahoo Plan Format
        return {
            name: title,
            description: description,
            ftp: ftp,
            intervals: intervals
        };
    }
};
