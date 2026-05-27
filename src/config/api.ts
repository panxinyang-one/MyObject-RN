import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/labels';

/** Android emulator reaches host machine via 10.0.2.2 */
const DEFAULT_DEV =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000';

export function getDefaultApiBaseUrl(): string {
  return DEFAULT_DEV;
}

export async function getApiBaseUrl(): Promise<string> {
  const custom = await AsyncStorage.getItem(STORAGE_KEYS.apiBaseUrl);
  return (custom?.trim() || DEFAULT_DEV).replace(/\/$/, '');
}

export async function setApiBaseUrl(url: string): Promise<void> {
  const trimmed = url.trim().replace(/\/$/, '');
  if (!trimmed) {
    await AsyncStorage.removeItem(STORAGE_KEYS.apiBaseUrl);
    return;
  }
  await AsyncStorage.setItem(STORAGE_KEYS.apiBaseUrl, trimmed);
}
