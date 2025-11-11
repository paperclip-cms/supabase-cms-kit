import { useState, useRef } from "react";
import { UploadedImage } from "./image-upload";

/**
 * Hook to manage image field state with proper syncing between form value and upload state.
 * Handles the complexity of tracking uploads in progress while keeping form value clean.
 */
export function useImageFieldState(
  value: string | string[],
  onChange: (value: string | string[]) => void,
  maxImages: number = 1,
) {
  // Local state for full image objects (including isUploading, tempId, etc.)
  const [images, setImages] = useState<UploadedImage[]>([]);

  // Store latest images in ref for function updaters
  const imagesRef = useRef(images);
  imagesRef.current = images;

  // Sync local state with form value when it changes externally
  const prevValueRef = useRef(value);
  if (prevValueRef.current !== value && images.every((img) => !img.isUploading)) {
    prevValueRef.current = value;
    const newImages: UploadedImage[] = Array.isArray(value)
      ? value.map((url, index) => ({
          url,
          path: url,
          name: `image-${index}`,
        }))
      : typeof value === "string" && value
        ? [{ url: value, path: value, name: "image" }]
        : [];
    if (JSON.stringify(newImages) !== JSON.stringify(images)) {
      setImages(newImages);
    }
  }

  const handleImagesChange = (
    newImages: UploadedImage[] | ((prev: UploadedImage[]) => UploadedImage[]),
  ) => {
    // Resolve function updater
    const updated =
      typeof newImages === "function"
        ? newImages(imagesRef.current)
        : newImages;

    // Update local state
    setImages(updated);

    // Sync only completed uploads to parent form
    const completedImages = updated.filter((img) => !img.isUploading);
    if (maxImages === 1) {
      onChange(completedImages[0]?.url || "");
    } else {
      onChange(completedImages.map((img) => img.url));
    }
  };

  return {
    images,
    handleImagesChange,
  };
}
