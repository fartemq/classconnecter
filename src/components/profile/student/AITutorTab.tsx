import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendAiTutorMessage } from "@/services/ai/aiTutorService";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

export const AITutorTab: React.FC = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: crypto.randomUUID(),
    role: "assistant",
    content: "Привет! Я ИИ‑репетитор. Опиши задачу или тему. Могу решать примеры, объяснять теорию и давать пошаговые подсказки.",
    createdAt: Date.now()
  }]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text, createdAt: Date.now() };
    setMessages((prev) => [...prev, userMsg]);

    setIsSending(true);
    try {
      const reply = await sendAiTutorMessage(
        messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-8) // send last 8 turns for brevity
          .map((m) => ({ role: m.role, content: m.content })),
        text
      );

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        createdAt: Date.now()
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      toast({ title: "Ошибка", description: "Не удалось получить ответ ИИ", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          ИИ‑репетитор
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div ref={scrollRef} className="h-[420px] overflow-y-auto rounded-md border p-3 bg-gray-50">
          {messages.map((m) => (
            <div key={m.id} className={`flex mb-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] whitespace-pre-wrap px-3 py-2 rounded-lg text-sm ${m.role === "user" ? "bg-blue-600 text-white" : "bg-white border"}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите задачу или вопрос... (Shift+Enter — перенос строки)"
            className="min-h-[60px]"
          />
          <Button onClick={handleSend} disabled={isSending || !input.trim()} className="h-[42px]">
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Подсказка: для арифметических примеров можно писать выражение прямо в сообщении. Я дам пошаговое объяснение и ответ.
        </div>
      </CardContent>
    </Card>
  );
}

export default AITutorTab;