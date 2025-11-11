"use client";

import { useState, useRef } from "react";
import { FieldConfig, FieldType } from "@/lib/types";
import { ImageUpload, UploadedImage } from "@/components/media/image-upload";
import { toast } from "sonner";

interface ImageFieldInputProps {
  field: FieldConfig;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string;
}

export function ImageFieldInput({
  field,
  value,
  onChange,
  error,
}: ImageFieldInputProps) {
  const maxImages = field.type === FieldType.Images ? 12 : 1;

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

  return (
    <div className="space-y-1">
      <ImageUpload
        images={images}
        onImagesChange={handleImagesChange}
        maxImages={maxImages}
        onSuccess={(message) => toast.success(message)}
        onError={(message) => toast.error(message)}
      />
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}
