import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../lib/AuthContext";

export function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inLogin = segments[0] === "login";

    if (!session && !inLogin) {
      router.replace("/login");
    } else if (session && inLogin) {
      router.replace("/");
    }
  }, [session, loading, segments, router]);

  return children;
}
