import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface ChatMessage { role: "user" | "assistant" | "system"; content: string }

const openaiEndpoint = "https://api.openai.com/v1/chat/completions";

async function aiReply(messages: ChatMessage[]): Promise<string> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) return fallback(messages);

  try {
    const res = await fetch(openaiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Ты дружелюбный ИИ‑репетитор. Объясняй по шагам кратко и понятно. Пиши по-русски." },
          ...messages,
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? fallback(messages);
  } catch (_e) {
    return fallback(messages);
  }
}

function fallback(messages: ChatMessage[]): string {
  const last = messages[messages.length - 1]?.content ?? "";
  return `Пока внешний ИИ недоступен. Вот общий план решения:\n1) Запишите условия задачи.\n2) Выберите формулы/подход.\n3) Подставьте значения и посчитайте.\n4) Проверьте ответ.\n\nВаш вопрос: "${last.slice(0, 180)}"`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const reply = await aiReply(messages ?? []);
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ reply: fallback([]), error: String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});