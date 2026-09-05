import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter, useSegments } from "expo-router";
import { useProfile } from "@nutrisnap/shared";
import { apiClient } from "../lib/apiClient";
import { useAuth } from "../lib/AuthContext";

export function OnboardingGate({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const { data: profile, isLoading } = useProfile(apiClient, { enabled: !!session });
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!session || isLoading) return;
    const inOnboarding = segments[0] === "onboarding";
    // A profile is created lazily with displayName: null on first access
    // (see backend profileRepository.get) — onboarding always sets a
    // non-empty name, so its absence is what gates a first-run user into
    // the setup flow, mirroring the web app's RequireOnboarding.
    const needsOnboarding = !!profile && !profile.displayName;

    if (needsOnboarding && !inOnboarding) {
      router.replace("/onboarding");
    } else if (!needsOnboarding && inOnboarding) {
      router.replace("/");
    }
  }, [session, isLoading, profile, segments, router]);

  return children;
}
