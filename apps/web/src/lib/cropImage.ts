import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.setAttribute("crossOrigin", "anonymous");
    img.src = src;
  });
}

/** Crops an image to the given pixel area and returns a compressed JPEG blob. */
export async function getCroppedImageBlob(
  imageSrc: string,
  cropPixels: Area,
  maxDimension = 1024,
  quality = 0.8,
): Promise<Blob> {
  const image = await loadImage(imageSrc);

  const scale = Math.min(
    1,
    maxDimension / Math.max(cropPixels.width, cropPixels.height),
  );
  const outputWidth = Math.round(cropPixels.width * scale);
  const outputHeight = Math.round(cropPixels.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode image"))),
      "image/jpeg",
      quality,
    );
  });
}
