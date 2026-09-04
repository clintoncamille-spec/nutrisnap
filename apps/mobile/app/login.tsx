import { useState } from "react";
import { View, Text, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { supabase } from "../lib/supabase";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    const { error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setIsSubmitting(false);
    if (error) setError(error.message);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 justify-center bg-neutral-50 p-6"
    >
      <Text className="mb-6 text-center text-2xl font-semibold text-neutral-900">
        NutriSnap
      </Text>
      <Card className="gap-3">
        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
        />
        {error && <Text className="text-sm text-danger-600">{error}</Text>}
        <Button
          label={mode === "signin" ? "Sign in" : "Create account"}
          onPress={handleSubmit}
          disabled={isSubmitting}
        />
      </Card>
      <View className="mt-4 items-center">
        <Text
          onPress={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          className="text-sm text-primary-700"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
