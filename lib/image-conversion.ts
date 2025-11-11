import imageCompression from "browser-image-compression";

export interface ImageConversionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

/**
 * Converts an image file to JPEG format
 * Handles HEIC/HEIF files using heic-to and other formats using canvas conversion
 */
export async function convertImageToJpeg(
  file: File,
  options: ImageConversionOptions = {},
): Promise<File> {
  const { maxSizeMB = 5, maxWidthOrHeight = 1920, quality = 0.8 } = options;

  // If it's already a JPEG, just compress it
  if (file.type === "image/jpeg") {
    return await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
    });
  }

  // Check if file is HEIC using the heic-to library
  try {
    const { isHeic } = await import("heic-to");
    const isHeicFile = await isHeic(file);

    if (isHeicFile) {
      try {
        const { heicTo } = await import("heic-to");

        const convertedBlob = await heicTo({
          blob: file,
          type: "image/jpeg",
          quality: quality,
        });

        // Convert blob to File
        const convertedFile = new File(
          [convertedBlob],
          file.name.replace(/\.(heic|heif)$/i, ".jpg"),
          {
            type: "image/jpeg",
            lastModified: Date.now(),
          },
        );

        // Compress the converted image
        return await imageCompression(convertedFile, {
          maxSizeMB,
          maxWidthOrHeight,
          useWebWorker: true,
        });
      } catch (error) {
        console.error("Error converting HEIC/HEIF:", error);

        // Provide helpful error messages based on the error type
        if (error instanceof Error) {
          if (
            error.message.includes("format not supported") ||
            error.message.includes("unsupported")
          ) {
            throw new Error(
              "This HEIF file format is not supported. Please convert it to JPEG, PNG, or WebP format using your device's photo app or an online converter.",
            );
          }
        }

        // Generic fallback with helpful instructions
        throw new Error(
          "Unable to convert this HEIF file. Please convert it to JPEG, PNG, or WebP format using your device's photo app or an online converter before uploading.",
        );
      }
    }
  } catch (error) {
    // If isHeic check fails, continue with other formats
    console.warn("Could not check if file is HEIC:", error);
  }

  // Handle other image formats (PNG, WebP, etc.)
  try {
    // First compress the image
    const compressedFile = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
    });

    // If it's not already JPEG, convert it
    if (compressedFile.type !== "image/jpeg") {
      return await convertToJpegUsingCanvas(compressedFile, quality);
    }

    return compressedFile;
  } catch (error) {
    console.error("Error processing image:", error);
    throw new Error("Failed to process image");
  }
}

/**
 * Converts an image to JPEG using canvas
 */
async function convertToJpegUsingCanvas(
  file: File,
  quality: number = 0.8,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Fill with white background for transparency
      ctx!.fillStyle = "#FFFFFF";
      ctx!.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the image
      ctx!.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const convertedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".jpg"),
              {
                type: "image/jpeg",
                lastModified: Date.now(),
              },
            );
            resolve(convertedFile);
          } else {
            reject(new Error("Failed to convert image to JPEG"));
          }
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for conversion"));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validates if a file is a supported image format
 * Note: For HEIC/HEIF files, this does a basic check based on MIME type and extension.
 * The actual HEIC detection is done in convertImageToJpeg using the isHeic function.
 */
export function isSupportedImageFormat(file: File): boolean {
  const supportedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/heic",
    "image/heif",
    "image/gif",
  ];

  const supportedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".avif",
    ".heic",
    ".heif",
    ".gif",
  ];

  return (
    supportedTypes.includes(file.type) ||
    supportedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  );
}
