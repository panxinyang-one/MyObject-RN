import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/labels';
import { MOCK_ITEMS } from '../data/mockItems';
import type { Item } from '../types/item';

export async function loadItems(): Promise<Item[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.items);
    if (!raw) {
      return [...MOCK_ITEMS];
    }
    const parsed = JSON.parse(raw) as Item[];
    return Array.isArray(parsed) ? parsed : [...MOCK_ITEMS];
  } catch {
    return [...MOCK_ITEMS];
  }
}

export async function saveItems(items: Item[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.items, JSON.stringify(items));
}

export async function clearItems(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.items);
}

export async function hasSeeded(): Promise<boolean> {
  const v = await AsyncStorage.getItem(STORAGE_KEYS.seeded);
  return v === 'true';
}

export async function markSeeded(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.seeded, 'true');
}
