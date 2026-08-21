import path from "path";
import fs from "fs/promises";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

// Images live in Cloudflare R2 in production. When R2 credentials are absent
// (local dev) the same keys are read from and written to a folder on disk, so
// callers never need to know which backend is active.
const LOCAL_ROOT =
  process.env.UPLOAD_ROOT || path.join(process.cwd(), "uploads");

const BUCKET = process.env.R2_BUCKET;
const r2 =
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  BUCKET
    ? new S3Client({
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      })
    : null;

console.log(
  r2
    ? `[Storage] Cloudflare R2 bucket: ${BUCKET}`
    : `[Storage] Local disk: ${LOCAL_ROOT}`,
);

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

export function getContentType(filename: string): string {
  return MIME[path.extname(filename).toLowerCase()] || "application/octet-stream";
}

/**
 * Compress an uploaded image to WebP and store it.
 * Returns the storage key, which is also its URL path segment.
 */
export async function storeMenuImage(
  originalName: string,
  buffer: Buffer,
): Promise<{ ok: boolean; key?: string; error?: unknown }> {
  try {
    const { default: sharp } = await import("sharp");
    sharp.cache(false);
    sharp.concurrency(1);

    const webp = await sharp(buffer)
      .webp({ quality: 75, effort: 4, smartSubsample: true })
      .toBuffer();

    const base = path
      .basename(originalName, path.extname(originalName))
      .replace(/[^a-zA-Z0-9_-]/g, "-");
    const key = `menu-items/${base}-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;

    await putObject(key, webp);
    console.log("[Storage] Stored:", key, `(${webp.length} bytes)`);

    return { ok: true, key };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function getImage(
  key: string,
): Promise<{ ok: boolean; buffer?: Buffer; error?: unknown }> {
  try {
    return { ok: true, buffer: await readObject(key) };
  } catch (error) {
    return { ok: false, error };
  }
}

async function putObject(key: string, body: Buffer): Promise<void> {
  if (r2) {
    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: body,
        ContentType: getContentType(key),
      }),
    );
    return;
  }

  const filePath = path.join(LOCAL_ROOT, key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, body);
}

async function readObject(key: string): Promise<Buffer> {
  if (r2) {
    const result = await r2.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    );
    return Buffer.from(await result.Body!.transformToByteArray());
  }

  return fs.readFile(path.join(LOCAL_ROOT, key));
}
