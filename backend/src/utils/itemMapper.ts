import type { ApiItem, ItemRow } from '../types';
import { config } from '../config';

function parseTags(raw: string | unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(String);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function toPublicImageUri(imageUrl: string | null): string {
  if (!imageUrl) {
    return '';
  }
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  const pathPart = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${config.publicBaseUrl}${pathPart}`;
}

export function rowToApiItem(row: ItemRow): ApiItem {
  return {
    id: String(row.id),
    name: row.name,
    location: row.location,
    note: row.note ?? '',
    imageUri: toPublicImageUri(row.image_url),
    tags: parseTags(row.tags_json),
    isPinned: Boolean(row.is_pinned),
    createdAt: new Date(row.created_at).toISOString(),
  };
}
