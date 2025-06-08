
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

    const { action, lessonId, name, description, boardId } = await req.json()

    if (action === 'create') {
      const { data: tokens } = await supabase
        .from('user_oauth_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'miro')
        .single()

      if (!tokens) {
        return new Response(
          JSON.stringify({ error: 'Miro account not connected' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      let accessToken = tokens.access_token

      if (new Date(tokens.expires_at) <= new Date()) {
        const refreshResponse = await fetch('https://api.miro.com/v1/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: Deno.env.get('MIRO_CLIENT_ID')!,
            client_secret: Deno.env.get('MIRO_CLIENT_SECRET')!,
            refresh_token: tokens.refresh_token!,
            grant_type: 'refresh_token',
          }),
        })

        const refreshData = await refreshResponse.json()
        accessToken = refreshData.access_token

        await supabase
          .from('user_oauth_tokens')
          .update({
            access_token: accessToken,
            expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
          })
          .eq('id', tokens.id)
      }

      const boardData = {
        name: name,
        description: description,
        policy: {
          permissionsPolicy: {
            collaborationToolsStartAccess: 'all_editors',
            copyAccess: 'anyone',
            sharingAccess: 'team_members_with_editing_rights'
          },
          sharingPolicy: {
            access: 'private',
            inviteToAccountAndBoardLinkAccess: 'no_access'
          }
        }
      }

      const boardResponse = await fetch('https://api.miro.com/v2/boards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(boardData),
      })

      const board = await boardResponse.json()

      if (board.error) {
        return new Response(
          JSON.stringify({ error: board.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: savedBoard, error } = await supabase
        .from('miro_boards')
        .insert({
          lesson_id: lessonId,
          board_id: board.id,
          board_url: board.viewLink,
          creator_id: user.id,
        })
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ board: savedBoard, miro_board: board }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'duplicate') {
      const { data: tokens } = await supabase
        .from('user_oauth_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'miro')
        .single()

      if (!tokens) {
        return new Response(
          JSON.stringify({ error: 'Miro account not connected' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const duplicateResponse = await fetch(`https://api.miro.com/v2/boards/${boardId}/copy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${name} - Копия`,
          description: `Копия доски для урока ${lessonId}`
        }),
      })

      const duplicatedBoard = await duplicateResponse.json()

      if (duplicatedBoard.error) {
        return new Response(
          JSON.stringify({ error: duplicatedBoard.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ board: duplicatedBoard }),
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
