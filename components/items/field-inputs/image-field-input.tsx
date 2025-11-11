"use client";

import { FieldConfig, FieldType } from "@/lib/types";
import { ImageUpload } from "@/components/media/image-upload";
import { useImageFieldState } from "@/components/media/use-image-field-state";
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
  const { images, handleImagesChange } = useImageFieldState(
    value,
    onChange,
    maxImages,
  );

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
