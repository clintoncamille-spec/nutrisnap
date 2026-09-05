import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Send, Sparkles } from "lucide-react-native";
import {
  COACH_QUICK_PROMPTS,
  answerFreeText,
  answerQuickPrompt,
  buildDailyBrief,
  coachMessageId,
  useDailySummary,
} from "@nutrisnap/shared";
import { colors } from "@nutrisnap/config/design-tokens";
import { apiClient } from "../../lib/apiClient";

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
}

export default function CoachScreen() {
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
  const scrollRef = useRef<ScrollView>(null);
  const allMessages = [...brief, ...messages];

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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-neutral-50"
    >
      <View className="px-4 pb-2 pt-16">
        <Text className="text-2xl font-semibold text-neutral-900">Nutritional AI Advisor</Text>
        <Text className="text-sm text-neutral-500">
          Daily feedback on your eating habits and macro balance.
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1 px-4"
        contentContainerClassName="gap-2 pb-2"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {isLoading && <Text className="text-sm text-neutral-400">Loading…</Text>}
        {allMessages.map((m) => (
          <View key={m.id} className={`flex-row ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "ai" && (
              <View className="mr-2 h-7 w-7 items-center justify-center rounded-md bg-primary-50">
                <Sparkles color={colors.primary[700]} size={14} />
              </View>
            )}
            <View
              className={`max-w-[76%] rounded-2xl px-3 py-2 ${
                m.role === "user" ? "rounded-br-sm bg-primary-600" : "rounded-bl-sm bg-neutral-100"
              }`}
            >
              <Text className={`text-sm ${m.role === "user" ? "text-white" : "text-neutral-900"}`}>
                {m.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4"
        contentContainerClassName="gap-2 pb-2"
      >
        {COACH_QUICK_PROMPTS.map((p) => (
          <Pressable
            key={p.id}
            disabled={!summary}
            onPress={() => handlePrompt(p.id, p.label)}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1.5"
            style={{ opacity: summary ? 1 : 0.5 }}
          >
            <Text className="text-xs font-medium text-neutral-900">{p.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View className="flex-row items-center gap-2 border-t border-neutral-200 bg-white px-4 py-3">
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask your advisor…"
          className="flex-1 rounded-full border border-neutral-200 px-4 py-2 text-sm"
        />
        <Pressable
          onPress={handleSend}
          disabled={!summary || !input.trim()}
          className="h-10 w-10 items-center justify-center rounded-full bg-primary-600"
          style={{ opacity: summary && input.trim() ? 1 : 0.5 }}
        >
          <Send color="white" size={16} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
