const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function isImageFile(file: File): boolean {
  return IMAGE_TYPES.includes(file.type) || file.type.startsWith('image/');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = src;
  });
}

function scaleDimensions(
  width: number,
  height: number,
  maxEdge: number
): { width: number; height: number } {
  if (width <= maxEdge && height <= maxEdge) return { width, height };
  const ratio = Math.min(maxEdge / width, maxEdge / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

export async function compressImageFile(
  file: File,
  maxEdge: number,
  quality = 0.82,
  maxBytes = 600_000
): Promise<string> {
  if (!isImageFile(file)) throw new Error('Please choose a JPEG, PNG, or WebP image.');

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const { width, height } = scaleDimensions(img.naturalWidth, img.naturalHeight, maxEdge);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not process image');

    ctx.drawImage(img, 0, 0, width, height);

    let q = quality;
    let dataUrl = canvas.toDataURL('image/jpeg', q);
    while (dataUrl.length > maxBytes && q > 0.35) {
      q -= 0.08;
      dataUrl = canvas.toDataURL('image/jpeg', q);
    }

    if (dataUrl.length > maxBytes) {
      throw new Error('Image is too large. Try a smaller photo.');
    }

    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function snapshotAvatarForPost(avatarUrl: string | null): Promise<string | null> {
  if (!avatarUrl) return null;
  try {
    const img = await loadImage(avatarUrl);
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const min = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - min) / 2;
    const sy = (img.naturalHeight - min) / 2;
    ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
    return canvas.toDataURL('image/jpeg', 0.75);
  } catch {
    return null;
  }
}