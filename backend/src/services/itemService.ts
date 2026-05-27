import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db/pool';
import type { ApiItem, ItemRow } from '../types';
import { rowToApiItem } from '../utils/itemMapper';

export type ItemInput = {
  name: string;
  location: string;
  note?: string;
  imageUri?: string;
  tags?: string[];
  isPinned?: boolean;
};

function assertItemInput(input: ItemInput): void {
  if (!input.name?.trim()) {
    throw new Error('name is required');
  }
  if (!input.location?.trim()) {
    throw new Error('location is required');
  }
}

function toStoredImageUrl(imageUri?: string): string | null {
  if (!imageUri?.trim()) {
    return null;
  }
  const uri = imageUri.trim();
  if (uri.startsWith('/uploads/')) {
    return uri;
  }
  try {
    const u = new URL(uri);
    if (u.pathname.startsWith('/uploads/')) {
      return u.pathname;
    }
  } catch {
    /* local file:// — keep as-is for metadata-only dev */
  }
  return uri.length <= 500 ? uri : null;
}

export async function listItems(userId: number): Promise<ApiItem[]> {
  const [rows] = await pool.query<ItemRow[]>(
    `SELECT id, user_id, name, location, note, image_url, tags_json, is_pinned, created_at, updated_at
     FROM items WHERE user_id = ? ORDER BY is_pinned DESC, updated_at DESC`,
    [userId],
  );
  return rows.map(rowToApiItem);
}

export async function createItem(
  userId: number,
  input: ItemInput,
): Promise<ApiItem> {
  assertItemInput(input);
  const tags = JSON.stringify(input.tags ?? []);
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO items (user_id, name, location, note, image_url, tags_json, is_pinned)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      input.name.trim(),
      input.location.trim(),
      input.note?.trim() ?? null,
      toStoredImageUrl(input.imageUri),
      tags,
      input.isPinned ? 1 : 0,
    ],
  );
  const item = await getItemById(userId, String(result.insertId));
  if (!item) {
    throw new Error('Failed to create item');
  }
  return item;
}

export async function updateItem(
  userId: number,
  id: string,
  patch: Partial<ItemInput>,
): Promise<ApiItem | null> {
  const itemId = Number(id);
  if (!Number.isFinite(itemId)) {
    return null;
  }

  const [existing] = await pool.query<ItemRow[]>(
    'SELECT * FROM items WHERE id = ? AND user_id = ? LIMIT 1',
    [itemId, userId],
  );
  if (!existing[0]) {
    return null;
  }

  const row = existing[0];
  const name = patch.name !== undefined ? patch.name.trim() : row.name;
  const location =
    patch.location !== undefined ? patch.location.trim() : row.location;
  const note =
    patch.note !== undefined ? (patch.note?.trim() ?? null) : row.note;
  const image_url =
    patch.imageUri !== undefined
      ? toStoredImageUrl(patch.imageUri)
      : row.image_url;
  const tags =
    patch.tags !== undefined
      ? JSON.stringify(patch.tags)
      : typeof row.tags_json === 'string'
        ? row.tags_json
        : JSON.stringify(row.tags_json);
  const is_pinned =
    patch.isPinned !== undefined ? (patch.isPinned ? 1 : 0) : row.is_pinned;

  await pool.query(
    `UPDATE items SET name=?, location=?, note=?, image_url=?, tags_json=?, is_pinned=?
     WHERE id=? AND user_id=?`,
    [name, location, note, image_url, tags, is_pinned, itemId, userId],
  );

  return getItemById(userId, id);
}

export async function deleteItem(
  userId: number,
  id: string,
): Promise<boolean> {
  const itemId = Number(id);
  if (!Number.isFinite(itemId)) {
    return false;
  }
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM items WHERE id = ? AND user_id = ?',
    [itemId, userId],
  );
  return result.affectedRows > 0;
}

export async function getItemById(
  userId: number,
  id: string,
): Promise<ApiItem | null> {
  const itemId = Number(id);
  if (!Number.isFinite(itemId)) {
    return null;
  }
  const [rows] = await pool.query<ItemRow[]>(
    `SELECT id, user_id, name, location, note, image_url, tags_json, is_pinned, created_at, updated_at
     FROM items WHERE id = ? AND user_id = ? LIMIT 1`,
    [itemId, userId],
  );
  return rows[0] ? rowToApiItem(rows[0]) : null;
}

export async function togglePin(
  userId: number,
  id: string,
): Promise<ApiItem | null> {
  const item = await getItemById(userId, id);
  if (!item) {
    return null;
  }
  return updateItem(userId, id, { isPinned: !item.isPinned });
}
