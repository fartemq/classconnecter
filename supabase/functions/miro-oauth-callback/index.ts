
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  // HTML template для callback страницы
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Miro OAuth Callback</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .success { color: green; }
        .error { color: red; }
      </style>
    </head>
    <body>
      <div id="status">Обработка авторизации...</div>
      <script>
        try {
          if (window.opener && window.opener.postMessage) {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            const error = urlParams.get('error');
            
            if (error) {
              document.getElementById('status').innerHTML = '<div class="error">Ошибка авторизации: ' + error + '</div>';
              window.opener.postMessage({
                type: 'miro_auth_error',
                error: error
              }, '*');
            } else if (code && state) {
              document.getElementById('status').innerHTML = '<div class="success">Авторизация успешна! Окно закроется автоматически.</div>';
              window.opener.postMessage({
                type: 'miro_auth_success',
                code: code,
                state: state
              }, '*');
              setTimeout(() => window.close(), 1500);
            } else {
              document.getElementById('status').innerHTML = '<div class="error">Некорректные параметры callback</div>';
              window.opener.postMessage({
                type: 'miro_auth_error',
                error: 'invalid_parameters'
              }, '*');
            }
          } else {
            document.getElementById('status').innerHTML = '<div class="error">Не удалось связаться с родительским окном</div>';
          }
        } catch (e) {
          console.error('Callback error:', e);
          document.getElementById('status').innerHTML = '<div class="error">Ошибка: ' + e.message + '</div>';
        }
      </script>
    </body>
    </html>
  `

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
})
