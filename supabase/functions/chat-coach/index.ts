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

    const { message } = await req.json()

    if (!message) {
      throw new Error('Message is required')
    }

    // 1. Fetch Context
    // Profile
    const { data: profile } = await supabaseClient
      .from('athlete_profile')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Current Active Plan
    const today = new Date().toISOString().split('T')[0]
    const { data: currentPlan } = await supabaseClient
      .from('training_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .lte('week_start', today)
      .gte('week_end', today)
      .maybeSingle()

    // Recent Chat History
    const { data: history } = await supabaseClient
      .from('coach_messages')
      .select('role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // 2. Persist User Message
    const { error: insertUserError } = await supabaseClient
      .from('coach_messages')
      .insert({
        user_id: user.id,
        role: 'user',
        content: message
      })

    if (insertUserError) throw insertUserError

    // 3. Construct Prompt
    const reversedHistory = history ? [...history].reverse() : []
    const messages = [
      {
        role: "system", content: `You are an elite triathlon coach. Your athlete is asking you a question.
        Context:
        Profile: ${JSON.stringify(profile)}
        Current Plan: ${currentPlan ? JSON.stringify(currentPlan) : "No active plan"}
        
        Answer concise, motivating, and strictly related to training.` },
      ...reversedHistory.map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message }
    ]

    // 4. Call LLM
    const deepseekKey = Deno.env.get('DEEPSEEK_API_KEY')
    const llmResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages
      })
    })

    const llmJson = await llmResponse.json()
    const responseContent = llmJson.choices?.[0]?.message?.content || "Sorry, I'm having trouble thinking right now."

    // 5. Persist Coach Response
    const { error: insertCoachError } = await supabaseClient
      .from('coach_messages')
      .insert({
        user_id: user.id,
        role: 'assistant', // Map coach to assistant for subsequent context
        content: responseContent
      })

    if (insertCoachError) {
      console.error("Failed to save coach message", insertCoachError)
    }

    return new Response(
      JSON.stringify({ response: responseContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})
