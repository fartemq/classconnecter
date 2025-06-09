
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

    const { action, lessonId, title, startTime, endTime } = await req.json()

    if (action === 'create') {
      // Получаем OAuth токен пользователя
      const { data: tokens } = await supabase
        .from('user_oauth_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'google')
        .maybeSingle()

      if (!tokens || new Date(tokens.expires_at) <= new Date()) {
        return new Response(
          JSON.stringify({ error: 'Google authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Создаем Google Meet через Calendar API
      const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: title || `Урок ${lessonId}`,
          start: {
            dateTime: startTime || new Date().toISOString(),
            timeZone: 'Europe/Moscow',
          },
          end: {
            dateTime: endTime || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            timeZone: 'Europe/Moscow',
          },
          conferenceData: {
            createRequest: {
              requestId: `meet-${lessonId}-${Date.now()}`,
              conferenceSolutionKey: {
                type: 'hangoutsMeet'
              }
            }
          }
        }),
      })

      const event = await calendarResponse.json()

      if (!calendarResponse.ok) {
        console.error('Calendar API error:', event)
        return new Response(
          JSON.stringify({ error: 'Failed to create Google Meet' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const meetLink = event.conferenceData?.entryPoints?.[0]?.uri || event.hangoutLink
      const meetingId = event.conferenceData?.conferenceId || event.id

      // Сохраняем сессию в базе данных
      const { data: session, error } = await supabase
        .from('google_meet_sessions')
        .insert({
          lesson_id: lessonId,
          meet_link: meetLink,
          meeting_id: meetingId,
          organizer_id: user.id,
          status: 'active'
        })
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to save session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ session }),
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
