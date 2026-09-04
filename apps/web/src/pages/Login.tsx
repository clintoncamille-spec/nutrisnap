import { type FormEvent, useState } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
    <div className="mx-auto flex max-w-sm flex-col justify-center gap-6 p-4 pt-24">
      <h1 className="text-center text-2xl font-semibold text-neutral-900">NutriSnap</h1>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-danger-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>
      </Card>
      <button
        onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
        className="text-center text-sm text-primary-700 hover:underline"
      >
        {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
