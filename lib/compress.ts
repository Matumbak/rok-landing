/**
 * Client-side image compression for migration application screenshots.
 *
 * RoK screenshots are predictable in shape — clean fonts on dark UI — so
 * heavy compression preserves readability of every digit and label that
 * matters for review. We resize the longest edge to MAX_DIMENSION and
 * encode as WebP at QUALITY, falling back to JPEG only when the browser
 * can't produce a WebP blob.
 *
 * Typical results: 1080×2400 PNG @ 1.4 MB → ~120 KB WebP.
 */

export const MAX_DIMENSION = 1280;
export const QUALITY = 0.78;

export interface CompressResult {
  blob: Blob;
  width: number;
  height: number;
  contentType: string;
}

export async function compressImage(file: File): Promise<CompressResult> {
  const bitmap = await loadBitmap(file);

  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = longest > MAX_DIMENSION ? MAX_DIMENSION / longest : 1;
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_2d_unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const webp = await canvasToBlob(canvas, "image/webp", QUALITY);
  if (webp && webp.size > 0) {
    return { blob: webp, width, height, contentType: "image/webp" };
  }

  const jpeg = await canvasToBlob(canvas, "image/jpeg", QUALITY);
  if (jpeg && jpeg.size > 0) {
    return { blob: jpeg, width, height, contentType: "image/jpeg" };
  }

  throw new Error("compression_failed");
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
  if ("createImageBitmap" in window) {
    return await createImageBitmap(file);
  }
  return await new Promise<ImageBitmap>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      // ImageBitmap-shaped polyfill: enough for drawImage.
      resolve(img as unknown as ImageBitmap);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image_load_failed"));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality);
  });
}
