"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Plus, Loader2, X } from "lucide-react";
import {
  convertImageToJpeg,
  isSupportedImageFormat,
} from "@/lib/image-conversion";
import Image from "next/image";

export interface UploadedImage {
  id?: string;
  url: string;
  path: string;
  name: string;
  tempId?: string;
  isUploading?: boolean;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onImagesChange: (
    images:
      | UploadedImage[]
      | ((prevImages: UploadedImage[]) => UploadedImage[]),
  ) => void;
  maxImages?: number;
  disabled?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function ImageUpload({
  images = [],
  onImagesChange,
  maxImages = 12,
  disabled = false,
  onSuccess,
  onError,
}: ImageUploadProps) {
  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const filesToUpload = acceptedFiles.slice(0, maxImages - images.length);

      if (filesToUpload.length < acceptedFiles.length) {
        onError?.(`Only ${maxImages - images.length} more image(s) allowed`);
      }

      // Create placeholder images immediately for all files
      const placeholderImages: UploadedImage[] = filesToUpload
        .filter((file) => isSupportedImageFormat(file))
        .map((file) => ({
          url: "", // Empty URL shows loading state
          path: "",
          name: file.name,
          tempId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isUploading: true,
        }));

      // Add placeholders immediately
      onImagesChange([...images, ...placeholderImages]);

      // Upload all files in parallel
      await Promise.all(
        filesToUpload.map(async (file, i) => {
          const placeholder = placeholderImages[i];

          // Validate file type
          if (!isSupportedImageFormat(file)) {
            onError?.(
              `${file.name}: Unsupported format. Please use JPEG, PNG, WebP, AVIF, HEIC, HEIF, or GIF`,
            );
            // Remove placeholder
            onImagesChange((currentImages) =>
              currentImages.filter((img) => img.tempId !== placeholder.tempId),
            );
            return;
          }

          try {
            // Convert image to JPEG with compression
            const convertedFile = await convertImageToJpeg(file, {
              maxSizeMB: 5,
              maxWidthOrHeight: 1920,
              quality: 0.8,
            });

            // Update placeholder with preview
            onImagesChange((currentImages) =>
              currentImages.map((img) =>
                img.tempId === placeholder.tempId
                  ? {
                      ...img,
                      url: URL.createObjectURL(convertedFile),
                    }
                  : img,
              ),
            );

            // Upload to API
            const formData = new FormData();
            formData.append("files", convertedFile);

            const response = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              throw new Error("Upload failed");
            }

            const result = await response.json();

            if (result.errors && result.errors.length > 0) {
              throw new Error(result.errors[0].error);
            }

            if (result.uploaded && result.uploaded.length > 0) {
              const uploadedFile = result.uploaded[0];

              // Replace temporary image with uploaded image
              onImagesChange((currentImages: UploadedImage[]) =>
                currentImages.map((img: UploadedImage) =>
                  img.tempId === placeholder.tempId
                    ? {
                        url: uploadedFile.url,
                        path: uploadedFile.path,
                        name: uploadedFile.name,
                        isUploading: false,
                      }
                    : img,
                ),
              );
              onSuccess?.(`${file.name} uploaded successfully`);
            }
          } catch (err) {
            // Remove placeholder on error
            onImagesChange((currentImages: UploadedImage[]) =>
              currentImages.filter(
                (img: UploadedImage) => img.tempId !== placeholder.tempId,
              ),
            );

            onError?.(`Failed to upload ${file.name}. Please try again.`);
            console.error("Upload error:", err);
          }
        }),
      );
    },
    [images, maxImages, onImagesChange, onSuccess, onError],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "image/*": [],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
    disabled: disabled || images.length >= maxImages,
  });

  const handleRemoveImage = useCallback(
    (imageToRemove: UploadedImage) => {
      const updatedImages = images.filter((img) => {
        const isMatch =
          img === imageToRemove ||
          (img.tempId && img.tempId === imageToRemove.tempId) ||
          (img.id && img.id === imageToRemove.id);
        return !isMatch;
      });

      onImagesChange(updatedImages);
    },
    [images, onImagesChange],
  );

  const canAddMore = images.length < maxImages && !disabled;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {/* Dropzone - always first */}
      {canAddMore && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed aspect-square
            flex flex-col items-center justify-center
            cursor-pointer transition-colors
            ${
              isDragActive
                ? "border-foreground bg-muted"
                : "border-border hover:border-foreground hover:bg-muted"
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="text-center p-2">
            <Plus className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {isDragActive ? "Drop here" : "Add"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {images.length}/{maxImages}
            </p>
          </div>
        </div>
      )}

      {/* Uploaded Images */}
      {images.map((image, index) => (
        <ImageThumbnail
          key={image.tempId || image.id || image.path || index}
          image={image}
          index={index}
          onRemove={() => handleRemoveImage(image)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

// Separate thumbnail component for better performance
function ImageThumbnail({
  image,
  index,
  onRemove,
  disabled,
}: {
  image: UploadedImage;
  index: number;
  onRemove: () => void;
  disabled: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="border border-border overflow-hidden aspect-square relative">
        {image.url ? (
          image.tempId ? (
            // Use native img for temp/uploading images (blob URLs)
            <img
              src={image.url}
              alt={`Upload ${index + 1}`}
              className={`w-full h-full object-cover transition-opacity ${
                isHovered && !image.isUploading ? "opacity-50" : "opacity-100"
              }`}
            />
          ) : (
            // Use Next Image for uploaded images
            <Image
              src={image.url}
              alt={`Upload ${index + 1}`}
              width={300}
              height={300}
              className={`w-full h-full object-cover transition-opacity ${
                isHovered && !image.isUploading ? "opacity-50" : "opacity-100"
              }`}
            />
          )
        ) : (
          // Empty state - show gray background while converting
          <div className="w-full h-full bg-muted" />
        )}

        {/* Loading overlay - visible while uploading */}
        {image.isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}

        {/* Delete button overlay - only visible on hover and not uploading */}
        {isHovered && !image.isUploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              disabled={disabled}
              className="h-10 w-10 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
