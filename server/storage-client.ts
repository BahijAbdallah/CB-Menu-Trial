import { Client } from '@replit/object-storage';
import path from 'path';

export const storageClient = new Client();

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
