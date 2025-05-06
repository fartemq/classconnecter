
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the session or user object
    const {
      data: { session },
    } = await supabaseClient.auth.getSession()

    if (!session) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse the URL and get endpoint path
    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()
    const body = await req.json()

    // Route to appropriate handler based on the path
    switch (path) {
      case 'get-student-lessons': {
        const { studentId, date } = body
        
        // Use explicit casting in the RPC function
        const { data, error } = await supabaseClient.rpc('get_student_lessons_by_date', { 
          p_student_id: studentId,
          p_date: date 
        })
        
        if (error) throw error
        
        return new Response(JSON.stringify({ data }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      case 'get-tutor-lessons': {
        const { tutorId, date } = body
        
        // Use explicit casting in the RPC function
        const { data, error } = await supabaseClient.rpc('get_tutor_lessons_by_date', { 
          p_tutor_id: tutorId,
          p_date: date 
        })
        
        if (error) throw error
        
        return new Response(JSON.stringify({ data }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      case 'create-lesson': {
        // Use explicit casting in the RPC function
        const { data, error } = await supabaseClient.rpc('create_lesson', body)
        
        if (error) throw error
        
        return new Response(JSON.stringify({ data }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      default:
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
