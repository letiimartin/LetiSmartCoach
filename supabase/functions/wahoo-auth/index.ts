
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { code, redirect_uri } = await req.json()

        if (!code) {
            throw new Error('No code provided')
        }

        // 1. Exchange code for tokens (Wahoo API)
        const clientId = Deno.env.get('WAHOO_CLIENT_ID')
        const clientSecret = Deno.env.get('WAHOO_CLIENT_SECRET')

        if (!clientId || !clientSecret) {
            console.error("Missing Wahoo specific environment variables")
            throw new Error("Server configuration error")
        }

        console.log(`Exchanging code for tokens...`)

        const tokenResponse = await fetch('https://api.wahooligan.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: redirect_uri || '', // Wahoo requires the same redirect_uri used in authorize
            }).toString(),
        })

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text()
            console.error("Wahoo Token Error:", errorText)
            throw new Error(`Wahoo API Error: ${tokenResponse.status}`)
        }

        const tokens = await tokenResponse.json()
        console.log("Tokens received")

        // 2. Save tokens to Supabase (using User JWT)
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing Authorization header')
        }

        // Create a Supabase client with the user's JWT
        // This ensures we respect RLS policies (User can only write their own tokens)
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // Verify user is logged in
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) {
            console.error("Auth User Error:", userError)
            throw new Error("Unauthorized")
        }

        const expiresAt = new Date(Date.now() + (tokens.expires_in || 7200) * 1000).toISOString()

        // Upsert tokens
        const { error: dbError } = await supabaseClient.from('wahoo_tokens').upsert({
            user_id: user.id,
            access_token_enc: tokens.access_token,
            refresh_token_enc: tokens.refresh_token, // Saving raw token in _enc column as per existing schema drift
            expires_at: expiresAt,
            scope: tokens.scope,
            updated_at: new Date().toISOString()
        })

        if (dbError) {
            console.error("DB Error:", dbError)
            throw new Error("Failed to save tokens")
        }

        return new Response(
            JSON.stringify({ success: true }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error("Function Error:", error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
