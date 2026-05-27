import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState } from '../components/EmptyState';
import { ItemCard } from '../components/ItemCard';
import { SectionHeader } from '../components/SectionHeader';
import { TagChips } from '../components/TagChips';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../context/ItemsContext';
import { colors, radius, spacing } from '../constants/theme';
import type { Item, RootStackParamList } from '../types/item';
import {
  filterItems,
  getAllTags,
  getPinnedItems,
  getRecentItems,
} from '../utils/itemFilters';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type ListRow =
  | { type: 'header'; title: string; key: string }
  | { type: 'item'; item: Item; key: string };

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { items, loading, syncError, isCloudMode } = useItems();
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);

  const pinned = useMemo(() => getPinnedItems(items), [items]);
  const pinnedIds = useMemo(() => new Set(pinned.map(i => i.id)), [pinned]);
  const recent = useMemo(
    () => getRecentItems(items, pinnedIds),
    [items, pinnedIds],
  );
  const allTags = useMemo(() => getAllTags(items), [items]);
  const filtered = useMemo(
    () => filterItems(items, query, tagFilter),
    [items, query, tagFilter],
  );

  const listData = useMemo((): ListRow[] => {
    const rows: ListRow[] = [];
    const isFiltering = query.trim().length > 0 || tagFilter !== null;

    if (isFiltering) {
      filtered.forEach(item => {
        rows.push({ type: 'item', item, key: item.id });
      });
      return rows;
    }

    if (pinned.length > 0) {
      rows.push({ type: 'header', title: '置顶', key: 'header-pinned' });
      pinned.forEach(item => {
        rows.push({ type: 'item', item, key: `pinned-${item.id}` });
      });
    }

    if (recent.length > 0) {
      rows.push({ type: 'header', title: '最近添加', key: 'header-recent' });
      recent.forEach(item => {
        rows.push({ type: 'item', item, key: `recent-${item.id}` });
      });
    }

    const shownIds = new Set([
      ...pinned.map(i => i.id),
      ...recent.map(i => i.id),
    ]);
    const rest = items.filter(i => !shownIds.has(i.id));
    if (rest.length > 0) {
      rows.push({ type: 'header', title: '全部物品', key: 'header-all' });
      rest.forEach(item => {
        rows.push({ type: 'item', item, key: item.id });
      });
    }

    return rows;
  }, [filtered, items, pinned, query, recent, tagFilter]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appTitle}>物证库</Text>
          <Text style={styles.subtitle}>宿舍物品 · 拍照即记</Text>
        </View>
        <Pressable
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsText}>设置</Text>
        </Pressable>
      </View>

      {!isAuthenticated ? (
        <Pressable
          style={styles.cloudBanner}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.cloudBannerText}>
            登录开启云同步 · 未登录为本地模式
          </Text>
        </Pressable>
      ) : isCloudMode && syncError ? (
        <View style={styles.syncWarn}>
          <Text style={styles.syncWarnText}>{syncError}</Text>
        </View>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          onAdd={() => navigation.navigate('AddItem', { openCamera: true })}
        />
      ) : (
        <>
          <View style={styles.searchWrap}>
            <TextInput
              style={styles.search}
              placeholder="搜索名称、位置、标签…"
              placeholderTextColor={colors.textSecondary}
              value={query}
              onChangeText={setQuery}
              clearButtonMode="while-editing"
            />
          </View>
          {allTags.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagScroll}
              keyboardShouldPersistTaps="handled">
              <TagChips
                tags={allTags}
                selected={tagFilter}
                onSelect={setTagFilter}
              />
            </ScrollView>
          ) : null}
          <FlatList
            data={listData}
            keyExtractor={row => row.key}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.noResult}>没有匹配的物品</Text>
            }
            renderItem={({ item: row }) => {
              if (row.type === 'header') {
                return <SectionHeader title={row.title} />;
              }
              return (
                <ItemCard
                  item={row.item}
                  onPress={() =>
                    navigation.navigate('ItemDetail', { itemId: row.item.id })
                  }
                />
              );
            }}
          />
        </>
      )}

      {items.length > 0 ? (
        <Pressable
          style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}
          onPress={() => navigation.navigate('AddItem')}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingsBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsText: {
    color: colors.primary,
    fontWeight: '600',
  },
  cloudBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.chip,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cloudBannerText: {
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13,
  },
  syncWarn: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#fff3f3',
    borderRadius: radius.sm,
  },
  syncWarnText: {
    color: colors.danger,
    fontSize: 12,
  },
  searchWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.text,
  },
  tagScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  noResult: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.xl,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '300',
  },
});
