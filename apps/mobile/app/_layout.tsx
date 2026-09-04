import "../global.css";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../lib/AuthContext";
import { AuthGate } from "../components/AuthGate";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="login" />
              <Stack.Screen
                name="scan/[mode]"
                options={{ presentation: "fullScreenModal" }}
              />
              <Stack.Screen name="results/[mode]" options={{ headerShown: true }} />
            </Stack>
          </AuthGate>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
