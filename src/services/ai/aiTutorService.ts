import { supabase } from "@/integrations/supabase/client";

export interface ChatTurn { role: "user" | "assistant" | "system"; content: string }

export const sendAiTutorMessage = async (history: ChatTurn[]): Promise<string> => {
  try {
    const payload = { messages: history };
    const { data, error } = await supabase.functions.invoke("ai-tutor", { body: payload });
    if (error) throw error;
    if (data && typeof data.reply === "string") return data.reply;
    // Fallback if malformed
    return "Извините, не получилось получить ответ. Попробуйте сформулировать вопрос иначе.";
  } catch (e) {
    console.error("AI tutor service error", e);
    // Local fallback explanation to keep feature functional without server
    const last = history[history.length - 1]?.content ?? "";
    return generateLocalFallback(last);
  }
};

const generateLocalFallback = (question: string): string => {
  // Very lightweight helper: try to evaluate simple arithmetic safely
  const expr = question.replace(/[^0-9+\-*/().,^% ]/g, "");
  let calcPart = "";
  try {
    if (/^[0-9+\-*/().%^ ]+$/.test(expr) && /[0-9]/.test(expr)) {
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict";return (${expr.replace("^", "**")});`)();
      if (typeof result === "number" && Number.isFinite(result)) {
        calcPart = `\n\nВычисление: ${expr} = ${result}`;
      }
    }
  } catch {}

  return [
    "Давайте разберёмся шаг за шагом.",
    "1) Выпишите известные данные и что требуется найти.",
    "2) Подберите формулы/правила, которые применимы к задаче.",
    "3) Подставьте значения и аккуратно посчитайте.",
    calcPart ? `4) Проверка результата: ${calcPart}` : "4) Проверьте размерности и здравый смысл ответа.",
    "\nЕсли пришлёте условие полностью (текст задачи и что требуется найти), дам подробное решение."
  ].join("\n");
};