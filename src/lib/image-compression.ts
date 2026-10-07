import imageCompression from "browser-image-compression";

/**
 * Compresses an image file for web use while preserving visual quality.
 * - Resizes to a max dimension suitable for menu card/detail display (including retina screens)
 * - Targets a reasonable file size without visible quality loss
 * - Keeps the original if compression would make it larger (e.g. already-optimized images)
 */
export async function compressImage(file: File): Promise<File> {
  // Skip compression for already-small files (e.g. small icons/graphics)
  if (file.size <= 300 * 1024) {
    return file;
  }

  try {
    const compressed = await imageCompression(file, {
      maxWidthOrHeight: 1600, // sharp on retina displays, no visible quality loss for food photos
      maxSizeMB: 0.6, // ~600KB cap, well within quality-preserving range for JPEG at this resolution
      initialQuality: 0.9, // high quality factor to avoid compression artifacts
      useWebWorker: true,
      alwaysKeepResolution: false,
    });

    // Safety net: if compression somehow produced a larger file, use the original
    if (compressed.size >= file.size) {
      return file;
    }

    return compressed;
  } catch (err) {
    console.error("Image compression failed, using original file:", err);
    return file;
  }
}
