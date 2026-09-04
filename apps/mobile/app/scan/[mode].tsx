import { useEffect } from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAnalyzeFridge, useAnalyzeMeal } from "@nutrisnap/shared";
import { apiClient } from "../../lib/apiClient";
import { CameraCapture } from "../../components/CameraCapture";
import { Button } from "../../components/Button";

export default function Scan() {
  const { mode } = useLocalSearchParams<{ mode: "meal" | "fridge" }>();
  const router = useRouter();

  const analyzeMeal = useAnalyzeMeal(apiClient);
  const analyzeFridge = useAnalyzeFridge(apiClient);
  const mutation = mode === "fridge" ? analyzeFridge : analyzeMeal;

  useEffect(() => {
    if (mutation.isSuccess) {
      router.replace({
        pathname: `/results/${mode}`,
        params: { result: JSON.stringify(mutation.data) },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.isSuccess]);

  const handleConfirm = async (photo: { uri: string; mimeType: string }) => {
    // React Native's fetch supports local file:// URIs and resolves a Blob,
    // which is the standard way to turn a captured photo into upload
    // payload without manual base64 handling.
    const response = await fetch(photo.uri);
    const blob = await response.blob();
    mutation.mutate({ blob, fileName: "photo.jpg", mimeType: photo.mimeType });
  };

  if (mutation.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Text className="text-neutral-600">
          Analyzing your {mode === "fridge" ? "ingredients" : "meal"}…
        </Text>
      </View>
    );
  }

  if (mutation.isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-white p-6">
        <Text className="text-center text-danger-600">
          {(mutation.error as Error).message || "Something went wrong. Try another photo."}
        </Text>
        <Button variant="secondary" label="Try again" onPress={() => mutation.reset()} />
      </View>
    );
  }

  return <CameraCapture onConfirm={handleConfirm} />;
}
