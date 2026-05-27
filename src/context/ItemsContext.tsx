import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createItemApi,
  deleteItemApi,
  fetchItemsApi,
  togglePinApi,
  updateItemApi,
} from '../api/itemsApi';
import { uploadImageIfNeeded } from '../api/uploadApi';
import { ApiError } from '../api/http';
import { SEED_ITEMS } from '../data/seedItems';
import {
  loadItems,
  markSeeded,
  saveItems,
} from '../storage/itemStorage';
import type { Item } from '../types/item';
import { useAuth } from './AuthContext';

type ItemsContextValue = {
  items: Item[];
  loading: boolean;
  syncError: string | null;
  isCloudMode: boolean;
  refreshItems: () => Promise<void>;
  addItem: (
    item: Omit<Item, 'id' | 'createdAt'> & { id?: string; createdAt?: string },
  ) => Promise<void>;
  updateItem: (id: string, patch: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  getItemById: (id: string) => Item | undefined;
  importSeedData: () => Promise<void>;
  clearAllItems: () => Promise<void>;
};

const ItemsContext = createContext<ItemsContextValue | null>(null);

function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const persistLocal = useCallback(async (next: Item[]) => {
    setItems(next);
    await saveItems(next);
  }, []);

  const refreshItems = useCallback(async () => {
    if (!isAuthenticated) {
      const loaded = await loadItems();
      setItems(loaded);
      setSyncError(null);
      return;
    }
    setLoading(true);
    setSyncError(null);
    try {
      const remote = await fetchItemsApi();
      await persistLocal(remote);
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : '同步失败';
      setSyncError(msg);
      const cached = await loadItems();
      setItems(cached);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, persistLocal]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      if (isAuthenticated) {
        try {
          const remote = await fetchItemsApi();
          if (mounted) {
            setItems(remote);
            await saveItems(remote);
            setSyncError(null);
          }
        } catch (e) {
          if (mounted) {
            const msg =
              e instanceof ApiError
                ? e.message
                : e instanceof Error
                  ? e.message
                  : '无法连接云端';
            setSyncError(msg);
            const cached = await loadItems();
            setItems(cached);
          }
        }
      } else {
        const loaded = await loadItems();
        if (mounted) {
          setItems(loaded);
          setSyncError(null);
        }
      }
      if (mounted) {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, token]);

  const addItem = useCallback(
    async (
      input: Omit<Item, 'id' | 'createdAt'> & {
        id?: string;
        createdAt?: string;
      },
    ) => {
      const imageUri = await uploadImageIfNeeded(input.imageUri);

      if (isAuthenticated) {
        try {
          const created = await createItemApi({ ...input, imageUri });
          setItems(prev => {
            const next = [created, ...prev.filter(i => i.id !== created.id)];
            saveItems(next).catch(() => {});
            return next;
          });
          setSyncError(null);
          return;
        } catch (e) {
          const msg =
            e instanceof ApiError
              ? e.message
              : e instanceof Error
                ? e.message
                : '保存到云端失败';
          setSyncError(msg);
          throw e;
        }
      }

      const newItem: Item = {
        ...input,
        imageUri,
        id: input.id ?? generateId(),
        createdAt: input.createdAt ?? new Date().toISOString(),
      };
      await persistLocal([newItem, ...items.filter(i => i.id !== newItem.id)]);
    },
    [isAuthenticated, items, persistLocal],
  );

  const updateItem = useCallback(
    async (id: string, patch: Partial<Item>) => {
      let nextPatch = patch;
      if (patch.imageUri) {
        nextPatch = {
          ...patch,
          imageUri: await uploadImageIfNeeded(patch.imageUri),
        };
      }

      if (isAuthenticated) {
        try {
          const updated = await updateItemApi(id, nextPatch);
          setItems(prev => {
            const next = prev.map(i => (i.id === id ? updated : i));
            saveItems(next).catch(() => {});
            return next;
          });
          setSyncError(null);
          return;
        } catch (e) {
          const msg =
            e instanceof ApiError
              ? e.message
              : e instanceof Error
                ? e.message
                : '更新失败';
          setSyncError(msg);
          throw e;
        }
      }

      const next = items.map(i => (i.id === id ? { ...i, ...nextPatch } : i));
      await persistLocal(next);
    },
    [isAuthenticated, items, persistLocal],
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        try {
          await deleteItemApi(id);
          setItems(prev => {
            const next = prev.filter(i => i.id !== id);
            saveItems(next).catch(() => {});
            return next;
          });
          setSyncError(null);
          return;
        } catch (e) {
          const msg =
            e instanceof ApiError
              ? e.message
              : e instanceof Error
                ? e.message
                : '删除失败';
          setSyncError(msg);
          throw e;
        }
      }
      await persistLocal(items.filter(i => i.id !== id));
    },
    [isAuthenticated, items, persistLocal],
  );

  const togglePin = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        try {
          const updated = await togglePinApi(id);
          setItems(prev => {
            const next = prev.map(i => (i.id === id ? updated : i));
            saveItems(next).catch(() => {});
            return next;
          });
          setSyncError(null);
          return;
        } catch (e) {
          const msg =
            e instanceof ApiError
              ? e.message
              : e instanceof Error
                ? e.message
                : '置顶操作失败';
          setSyncError(msg);
          throw e;
        }
      }
      const next = items.map(i =>
        i.id === id ? { ...i, isPinned: !i.isPinned } : i,
      );
      await persistLocal(next);
    },
    [isAuthenticated, items, persistLocal],
  );

  const getItemById = useCallback(
    (id: string) => items.find(i => i.id === id),
    [items],
  );

  const importSeedData = useCallback(async () => {
    if (isAuthenticated) {
      setSyncError('云端模式下请用真实数据；演示种子仅适合离线模式');
      return;
    }
    await persistLocal([...SEED_ITEMS]);
    await markSeeded();
  }, [isAuthenticated, persistLocal]);

  const clearAllItems = useCallback(async () => {
    if (isAuthenticated) {
      try {
        for (const item of items) {
          await deleteItemApi(item.id);
        }
        await persistLocal([]);
        setSyncError(null);
        return;
      } catch (e) {
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : '清空失败';
        setSyncError(msg);
        throw e;
      }
    }
    await persistLocal([]);
  }, [isAuthenticated, items, persistLocal]);

  const value = useMemo(
    () => ({
      items,
      loading,
      syncError,
      isCloudMode: isAuthenticated,
      refreshItems,
      addItem,
      updateItem,
      deleteItem,
      togglePin,
      getItemById,
      importSeedData,
      clearAllItems,
    }),
    [
      items,
      loading,
      syncError,
      isAuthenticated,
      refreshItems,
      addItem,
      updateItem,
      deleteItem,
      togglePin,
      getItemById,
      importSeedData,
      clearAllItems,
    ],
  );

  return (
    <ItemsContext.Provider value={value}>{children}</ItemsContext.Provider>
  );
}

export function useItems(): ItemsContextValue {
  const ctx = useContext(ItemsContext);
  if (!ctx) {
    throw new Error('useItems must be used within ItemsProvider');
  }
  return ctx;
}
