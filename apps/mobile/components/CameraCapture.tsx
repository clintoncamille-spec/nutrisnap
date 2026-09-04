import { useRef, useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Camera, Images } from "lucide-react-native";
import { Button } from "./Button";

interface CapturedPhoto {
  uri: string;
}

interface Props {
  onConfirm: (photo: { uri: string; mimeType: string }) => void;
}

async function processForUpload(uri: string) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1024 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
  );
  return result.uri;
}

export function CameraCapture({ onConfirm }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<CapturedPhoto | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center gap-4 p-6">
        <Camera size={32} color="#737373" />
        <Text className="text-center text-neutral-600">
          {permission.canAskAgain
            ? "NutriSnap needs camera access to scan meals and ingredients."
            : "Camera access was denied. Enable it in Settings to scan photos."}
        </Text>
        {permission.canAskAgain && (
          <Button label="Grant camera access" onPress={requestPermission} />
        )}
      </View>
    );
  }

  if (photo) {
    return (
      <View className="flex-1">
        <Image source={{ uri: photo.uri }} className="flex-1" resizeMode="cover" />
        <View className="flex-row justify-between gap-4 bg-white p-4">
          <Button
            variant="secondary"
            label="Retake"
            onPress={() => setPhoto(null)}
          />
          <Button
            label="Use photo"
            onPress={async () => {
              const processedUri = await processForUpload(photo.uri);
              onConfirm({ uri: processedUri, mimeType: "image/jpeg" });
            }}
          />
        </View>
      </View>
    );
  }

  const handleCapture = async () => {
    const result = await cameraRef.current?.takePictureAsync({ quality: 0.9 });
    if (result) setPhoto({ uri: result.uri });
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto({ uri: result.assets[0].uri });
    }
  };

  return (
    <View className="flex-1">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
      <View className="flex-row items-center justify-between bg-black/80 px-8 py-6">
        <Pressable onPress={handlePickFromGallery} hitSlop={12}>
          <Images size={26} color="white" />
        </Pressable>
        <Pressable
          onPress={handleCapture}
          className="h-16 w-16 items-center justify-center rounded-full border-4 border-white"
        >
          <View className="h-12 w-12 rounded-full bg-white" />
        </Pressable>
        <View className="w-[26px]" />
      </View>
    </View>
  );
}
