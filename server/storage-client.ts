import { Client } from '@replit/object-storage';
import path from 'path';
import { LRUCache } from 'lru-cache';

export const storageClient = new Client();

const imageCache = new LRUCache<string, Buffer>({
  max: 200,
  maxSize: 100 * 1024 * 1024,
  sizeCalculation: (buffer) => buffer.length,
  ttl: 1000 * 60 * 60,
});

export function generateImageFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const ext = path.extname(originalName);
  return `menu-items/${timestamp}-${random}${ext}`;
}

export function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
  };
  return contentTypes[ext] || 'image/jpeg';
}

export async function getCachedImage(filename: string): Promise<{ ok: boolean; buffer?: Buffer; error?: any }> {
  const cached = imageCache.get(filename);
  if (cached) {
    console.log('[Cache] HIT for:', filename);
    return { ok: true, buffer: cached };
  }
  
  console.log('[Cache] MISS for:', filename, '- downloading from Object Storage');
  const { ok, value, error } = await storageClient.downloadAsBytes(filename);
  
  if (!ok) {
    return { ok: false, error };
  }
  
  const imageData = Array.isArray(value) ? value[0] : value;
  const buffer = Buffer.from(imageData);
  
  imageCache.set(filename, buffer);
  console.log('[Cache] Stored:', filename, `(${buffer.length} bytes)`);
  
  return { ok: true, buffer };
}
