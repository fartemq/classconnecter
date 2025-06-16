
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    )

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, code, state } = await req.json()

    if (action === 'authorize') {
      const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
      const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-oauth-callback`
      
      if (!clientId) {
        return new Response(
          JSON.stringify({ error: 'Google OAuth not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const authState = `${user.id}-${Date.now()}`
      const scope = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email'
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${authState}&` +
        `access_type=offline&` +
        `prompt=consent`

      return new Response(
        JSON.stringify({ auth_url: authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'callback') {
      if (!code || !state) {
        return new Response(
          JSON.stringify({ error: 'Missing code or state' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify state contains user ID
      if (!state.startsWith(user.id)) {
        return new Response(
          JSON.stringify({ error: 'Invalid state parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
      const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
      const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-oauth-callback`

      if (!clientId || !clientSecret) {
        return new Response(
          JSON.stringify({ error: 'Google OAuth not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      })

      const tokens = await tokenResponse.json()

      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', tokens)
        return new Response(
          JSON.stringify({ error: 'Failed to exchange code for tokens' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Store tokens in database
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)
      
      const { error: dbError } = await supabase
        .from('user_oauth_tokens')
        .upsert({
          user_id: user.id,
          provider: 'google',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt.toISOString(),
        })

      if (dbError) {
        console.error('Database error:', dbError)
        return new Response(
          JSON.stringify({ error: 'Failed to save tokens' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
