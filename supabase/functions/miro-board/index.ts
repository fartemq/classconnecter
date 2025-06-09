
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
      // Получаем OAuth токен пользователя
      const { data: tokens } = await supabase
        .from('user_oauth_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'miro')
        .maybeSingle()

      if (!tokens || new Date(tokens.expires_at) <= new Date()) {
        return new Response(
          JSON.stringify({ error: 'Miro authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Создаем Miro Board
      const miroResponse = await fetch('https://api.miro.com/v2/boards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || `Урок ${lessonId}`,
          description: description || 'Интерактивная доска для урока',
          policy: {
            permissionsPolicy: {
              collaborationToolsStartAccess: 'all_editors',
              copyAccess: 'anyone',
              sharingAccess: 'team_members_with_editing_rights'
            }
          }
        }),
      })

      const board = await miroResponse.json()

      if (!miroResponse.ok) {
        console.error('Miro API error:', board)
        return new Response(
          JSON.stringify({ error: 'Failed to create Miro board' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Сохраняем доску в базе данных
      const { data: savedBoard, error } = await supabase
        .from('miro_boards')
        .insert({
          lesson_id: lessonId,
          board_id: board.id,
          board_url: board.viewLink,
          creator_id: user.id,
          status: 'active'
        })
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to save board' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ board: savedBoard }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'duplicate') {
      // Получаем OAuth токен пользователя
      const { data: tokens } = await supabase
        .from('user_oauth_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'miro')
        .maybeSingle()

      if (!tokens || new Date(tokens.expires_at) <= new Date()) {
        return new Response(
          JSON.stringify({ error: 'Miro authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Дублируем доску
      const duplicateResponse = await fetch(`https://api.miro.com/v2/boards/${boardId}/copy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Копия урока ${lessonId}`,
        }),
      })

      const duplicatedBoard = await duplicateResponse.json()

      if (!duplicateResponse.ok) {
        console.error('Miro duplicate error:', duplicatedBoard)
        return new Response(
          JSON.stringify({ error: 'Failed to duplicate board' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, board: duplicatedBoard }),
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
