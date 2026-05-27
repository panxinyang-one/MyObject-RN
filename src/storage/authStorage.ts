import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/labels';

export async function saveAuth(token: string, email: string): Promise<void> {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.token, token],
    [STORAGE_KEYS.userEmail, email],
  ]);
}

export async function loadAuth(): Promise<{
  token: string | null;
  email: string | null;
}> {
  const pairs = await AsyncStorage.multiGet([
    STORAGE_KEYS.token,
    STORAGE_KEYS.userEmail,
  ]);
  const map = Object.fromEntries(pairs);
  return {
    token: map[STORAGE_KEYS.token] ?? null,
    email: map[STORAGE_KEYS.userEmail] ?? null,
  };
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.token,
    STORAGE_KEYS.userEmail,
  ]);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.token);
}
