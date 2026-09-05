import "../global.css";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../lib/AuthContext";
import { AuthGate } from "../components/AuthGate";
import { OnboardingGate } from "../components/OnboardingGate";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthGate>
            <OnboardingGate>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="login" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen
                  name="scan/[mode]"
                  options={{ presentation: "fullScreenModal" }}
                />
                <Stack.Screen name="results/[mode]" options={{ headerShown: true }} />
              </Stack>
            </OnboardingGate>
          </AuthGate>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
