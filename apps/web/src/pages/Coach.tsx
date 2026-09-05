import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import {
  COACH_QUICK_PROMPTS,
  answerFreeText,
  answerQuickPrompt,
  buildDailyBrief,
  coachMessageId,
  useDailySummary,
} from "@nutrisnap/shared";
import { apiClient } from "../lib/apiClient";

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
}

export function Coach() {
  const { data: summary, isLoading } = useDailySummary(apiClient);
  // The daily brief is derived fresh from today's live totals on every
  // render rather than seeded into state via an effect — it always
  // reflects the latest data, and it sidesteps the "setState in an
  // effect just to initialize" anti-pattern entirely.
  const brief: Message[] = summary
    ? [{ id: "brief", role: "ai", text: buildDailyBrief(summary) }]
    : [];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const allMessages = [...brief, ...messages];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [allMessages.length]);

  function pushAi(text: string) {
    setMessages((m) => [...m, { id: coachMessageId(), role: "ai", text }]);
  }
  function pushUser(text: string) {
    setMessages((m) => [...m, { id: coachMessageId(), role: "user", text }]);
  }

  function handlePrompt(promptId: string, label: string) {
    if (!summary) return;
    pushUser(label);
    setTimeout(() => pushAi(answerQuickPrompt(promptId, summary)), 300);
  }

  function handleSend() {
    const text = input.trim();
    if (!text || !summary) return;
    pushUser(text);
    setInput("");
    setTimeout(() => pushAi(answerFreeText(text, summary)), 300);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <header>
        <h1 className="text-2xl font-semibold text-neutral-900">Nutritional AI Advisor</h1>
        <p className="text-sm text-neutral-500">
          Daily feedback on your eating habits and macro balance.
        </p>
      </header>

      <div ref={scrollRef} className="flex max-h-[55vh] flex-col gap-2 overflow-y-auto">
        {isLoading && <p className="text-sm text-neutral-400">Loading…</p>}
        {allMessages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "ai" && (
              <span className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                <Sparkles size={14} />
              </span>
            )}
            <div
              className={`max-w-[76%] rounded-2xl px-3 py-2 text-sm ${
                m.role === "user"
                  ? "rounded-br-sm bg-primary-600 text-white"
                  : "rounded-bl-sm bg-neutral-100 text-neutral-900"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {COACH_QUICK_PROMPTS.map((p) => (
          <button
            key={p.id}
            onClick={() => handlePrompt(p.id, p.label)}
            disabled={!summary}
            className="shrink-0 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Ask your advisor…"
          className="flex-1 rounded-full border border-neutral-200 px-4 py-2 text-sm"
        />
        <button
          onClick={handleSend}
          disabled={!summary || !input.trim()}
          aria-label="Send"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
