export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function canvasJpeg(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void, quality: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw the photo");
  draw(ctx);
  return canvas.toDataURL("image/jpeg", quality);
}

async function compressViaBitmap(source: Blob, maxDim: number, quality: number) {
  const bitmap = await createImageBitmap(source);
  try {
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    return canvasJpeg(width, height, (ctx) => ctx.drawImage(bitmap, 0, 0, width, height), quality);
  } finally {
    bitmap.close();
  }
}

async function compressViaImage(source: Blob, maxDim: number, quality: number) {
  const url = URL.createObjectURL(source);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not read that photo"));
      el.src = url;
    });
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    return canvasJpeg(width, height, (ctx) => ctx.drawImage(img, 0, 0, width, height), quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function compressImage(
  source: File | Blob,
  maxDim = 1280,
  quality = 0.72,
): Promise<string> {
  try {
    return await compressViaBitmap(source, maxDim, quality);
  } catch {
    try {
      return await compressViaImage(source, maxDim, quality);
    } catch {
      throw new Error("Could not read that photo. Pick a JPEG or PNG from the gallery, or take a new shot.");
    }
  }
}

export async function urlToCompressedDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not load that photo");
  const blob = await res.blob();
  return compressImage(blob);
}
