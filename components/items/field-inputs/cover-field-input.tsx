"use client";

import { UseFormReturn } from "react-hook-form";
import { ImageUpload } from "@/components/media/image-upload";
import { useImageFieldState } from "@/components/media/use-image-field-state";
import { toast } from "sonner";

interface CoverFieldInputProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

export function CoverFieldInput({ form }: CoverFieldInputProps) {
  const coverValue = form.watch("cover");
  const { images, handleImagesChange } = useImageFieldState(
    coverValue || "",
    (newValue) => form.setValue("cover", newValue as string),
    1,
  );

  return (
    <ImageUpload
      images={images}
      onImagesChange={handleImagesChange}
      maxImages={1}
      onSuccess={(message) => toast.success(message)}
      onError={(message) => toast.error(message)}
    />
  );
}
