/*
 * Photos abhi localStorage + shared data.json me jaati hain, isliye har file ko
 * browser me hi resize karke JPEG data-URL bana lete hain. Warna ek 4 MB ki
 * phone photo hi poora storage bhar deti.
 *
 * TODO(backend): asli upload aane par is file ko POST /api/uploads se replace
 * karein — baaki UI waisa hi rahega, bas yahan se URL wapas aayega.
 */

/** Ek listing me max itni photos. */
export const MAX_PHOTOS = 10;
/** Submit karne ke liye kam se kam itni photos chahiye. */
export const MIN_PHOTOS = 5;

const MAX_EDGE = 1280;
const QUALITY = 0.7;

export class ImageUploadError extends Error {}

/** File ko resize karke compressed JPEG data-URL me badalta hai. */
export async function fileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new ImageUploadError(`${file.name} image file nahi hai.`);
  }

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new ImageUploadError(`${file.name} padha nahi ja saka.`);
  });

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageUploadError("Browser image process nahi kar paya.");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", QUALITY);
}
