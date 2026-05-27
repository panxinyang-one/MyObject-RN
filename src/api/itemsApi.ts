import type { Item } from '../types/item';
import { apiFetch } from './http';

export async function fetchItemsApi(): Promise<Item[]> {
  const data = await apiFetch<{ items: Item[] }>('/items');
  return data.items ?? [];
}

export async function createItemApi(
  input: Omit<Item, 'id' | 'createdAt'>,
): Promise<Item> {
  const data = await apiFetch<{ item: Item }>('/items', {
    method: 'POST',
    json: input,
  });
  return data.item;
}

export async function updateItemApi(
  id: string,
  patch: Partial<Item>,
): Promise<Item> {
  const data = await apiFetch<{ item: Item }>(`/items/${id}`, {
    method: 'PATCH',
    json: patch,
  });
  return data.item;
}

export async function deleteItemApi(id: string): Promise<void> {
  await apiFetch<void>(`/items/${id}`, { method: 'DELETE' });
}

export async function togglePinApi(id: string): Promise<Item> {
  const data = await apiFetch<{ item: Item }>(`/items/${id}/toggle-pin`, {
    method: 'POST',
  });
  return data.item;
}
