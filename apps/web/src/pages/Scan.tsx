import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { useAnalyzeFridge, useAnalyzeMeal } from "@nutrisnap/shared";
import { apiClient } from "../lib/apiClient";
import { ImageSourcePicker } from "../components/ImageSourcePicker";
import { CropModal } from "../components/CropModal";
import { Button } from "../components/Button";

type Mode = "meal" | "fridge";

export function Scan() {
  const { mode } = useParams<{ mode: Mode }>();
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const analyzeMeal = useAnalyzeMeal(apiClient);
  const analyzeFridge = useAnalyzeFridge(apiClient);
  const mutation = mode === "fridge" ? analyzeFridge : analyzeMeal;

  // Held in a union-typed variable above, so we navigate from an effect on
  // its result rather than passing per-call onSuccess options (TanStack
  // Query's mutate() overloads don't merge cleanly across a union of two
  // differently-typed mutation results).
  useEffect(() => {
    if (mutation.isSuccess) {
      navigate(`/results/${mode}`, { state: { result: mutation.data } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.isSuccess]);

  const handleSelect = (file: File) => {
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCropConfirm = async (blob: Blob) => {
    setPreviewUrl(null);
    const compressed = await imageCompression(
      new File([blob], "photo.jpg", { type: "image/jpeg" }),
      { maxSizeMB: 2, maxWidthOrHeight: 1024, useWebWorker: true },
    );

    mutation.mutate({ blob: compressed, fileName: "photo.jpg", mimeType: "image/jpeg" });
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold text-neutral-900">
        {mode === "fridge" ? "Scan your fridge" : "Scan your meal"}
      </h1>
      <p className="text-sm text-neutral-500">
        {mode === "fridge"
          ? "Take a photo of your ingredients and we'll suggest 3 recipes."
          : "Take a photo of your plate and we'll estimate calories and macros."}
      </p>

      <ImageSourcePicker
        onSelect={handleSelect}
        label="Drag and drop a photo here, or use the button below"
      />

      {mutation.isPending && (
        <p className="text-center text-sm text-neutral-500">
          Analyzing your {mode === "fridge" ? "ingredients" : "meal"}…
        </p>
      )}

      {mutation.isError && (
        <div className="rounded-md bg-danger-50 p-3 text-sm text-danger-600">
          {(mutation.error as Error).message || "Something went wrong. Try another photo."}
          <div className="mt-2">
            <Button variant="secondary" onClick={() => mutation.reset()}>
              Try again
            </Button>
          </div>
        </div>
      )}

      {previewUrl && (
        <CropModal
          imageSrc={previewUrl}
          onCancel={() => setPreviewUrl(null)}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  );
}
