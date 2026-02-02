import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { week_start } = await req.json()

    if (!week_start) {
      throw new Error('week_start is required')
    }

    // Calculate dates
    const startDt = new Date(week_start)
    const endDt = new Date(startDt)
    endDt.setDate(startDt.getDate() + 6)
    const weekEndStr = endDt.toISOString().split('T')[0]

    // 1. Fetch Context
    // Profile
    const { data: profile } = await supabaseClient
      .from('athlete_profile')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Calendar Events (Constraints)
    const { data: events } = await supabaseClient
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_dt', week_start)
      .lte('end_dt', weekEndStr)

    // Recent Workouts (History) - Last 28 days
    const recentStart = new Date(startDt)
    recentStart.setDate(startDt.getDate() - 28)
    const { data: history } = await supabaseClient
      .from('workouts')
      .select('start_dt, sport, duration_s, tss, perceived_exertion, notes')
      .eq('user_id', user.id)
      .gte('start_dt', recentStart.toISOString())
      .order('start_dt', { ascending: false })

    // 2. Construct Prompt
    const prompt = `
You are an elite triathlon coach. Create a training plan for the week of ${week_start} to ${weekEndStr}.
Profile: ${JSON.stringify(profile)}
Constraints (Calendar Events): ${JSON.stringify(events)}
Recent History (Last 4 weeks): ${JSON.stringify(history)}

Rules:
1. No nutrition advice.
2. Focus on the athlete's goals and current state (fatigue/freshness inferred from history).
3. Respect calendar constraints (time availability).
4. Output STRICT JSON in the following format.

Output JSON Structure:
{
  "rationale": "Short explanation of the week's focus",
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "sport": "Swim" | "Bike" | "Run" | "Gym" | "Rest",
      "duration_s": number (seconds),
      "description": "Short title",
      "structure": [
        {
          "type": "Warmup" | "Main" | "Cooldown" | "Rest",
          "duration_s": number,
          "target_type": "Zone" | "Power" | "HR" | "RPE",
          "target_min": number | string,
          "target_max": number | string,
          "notes": "Description of the step"
        }
      ],
      "targets": {
        "tss_estimate": number,
        "primary_zone": "Z1" | "Z2" ...
      }
    }
  ]
}
`

    // 3. Call LLM (DeepSeek)
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY')
    if (!deepseekKey) {
      throw new Error('DEEPSEEK_API_KEY is not set')
    }

    const llmResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful assistant. Output only valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    })

    if (!llmResponse.ok) {
      const errorText = await llmResponse.text()
      console.error("DeepSeek API Error:", llmResponse.status, errorText)
      throw new Error(`Failed to get plan from LLM: ${llmResponse.status} ${errorText}`)
    }

    const llmJson = await llmResponse.json()
    if (!llmJson.choices || !llmJson.choices[0].message.content) {
      throw new Error('Failed to get plan from LLM')
    }

    const planContent = JSON.parse(llmJson.choices[0].message.content)

    // 4. Save to Database
    // Transaction-like: Create Plan first
    const { data: insertedPlan, error: planError } = await supabaseClient
      .from('training_plans')
      .insert({
        user_id: user.id,
        week_start: week_start,
        week_end: weekEndStr,
        status: 'active',
        plan_json: planContent, // Backup
        rationale: planContent.rationale
      })
      .select()
      .single()

    if (planError) throw planError

    // Insert Sessions
    const sessionsToInsert = planContent.sessions.map((s: any) => ({
      user_id: user.id,
      plan_id: insertedPlan.id,
      date: s.date,
      sport: s.sport,
      duration_s: s.duration_s,
      structure_json: s.structure,
      targets_json: s.targets,
      export_status: 'pending' // Default for new sessions
    }))

    const { error: sessionError } = await supabaseClient
      .from('planned_sessions')
      .insert(sessionsToInsert)

    if (sessionError) throw sessionError

    return new Response(
      JSON.stringify(planContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    const errObj = {
      error: error.message,
      stack: error.stack,
      hint: "Check server logs"
    }

    // Explicitly check for common issues
    if (error.message.includes('week_start')) {
      errObj.hint = "Missing week_start in body"
    }
    if (error.message.includes('Unauthorized')) {
      errObj.hint = "Auth token missing or invalid"
    }

    return new Response(
      JSON.stringify(errObj),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})
