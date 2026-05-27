import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TagChips } from '../components/TagChips';
import { useItems } from '../context/ItemsContext';
import { colors, radius, spacing } from '../constants/theme';
import type { RootStackParamList } from '../types/item';

type Props = NativeStackScreenProps<RootStackParamList, 'ItemDetail'>;

export function ItemDetailScreen({ navigation, route }: Props) {
  const { itemId } = route.params;
  const { getItemById, deleteItem, togglePin } = useItems();
  const item = getItemById(itemId);

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.missing}>物品不存在或已被删除</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>返回</Text>
        </Pressable>
      </View>
    );
  }

  const confirmDelete = () => {
    Alert.alert('确认删除', `确定删除「${item.name}」吗？此操作不可恢复。`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          deleteItem(item.id)
            .then(() => navigation.goBack())
            .catch(() =>
              Alert.alert('删除失败', '请检查网络或稍后重试'),
            );
        },
      },
    ]);
  };

  const created = new Date(item.createdAt).toLocaleString('zh-CN');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: item.imageUri }} style={styles.image} />
      <View style={styles.header}>
        <Text style={styles.name}>{item.name}</Text>
        {item.isPinned ? <Text style={styles.pinBadge}>已置顶</Text> : null}
      </View>
      <Text style={styles.meta}>创建于 {created}</Text>

      <Text style={styles.label}>存放位置</Text>
      <Text style={styles.value}>{item.location}</Text>

      {item.note ? (
        <>
          <Text style={styles.label}>备注</Text>
          <Text style={styles.value}>{item.note}</Text>
        </>
      ) : null}

      {item.tags.length > 0 ? (
        <>
          <Text style={styles.label}>标签</Text>
          <TagChips tags={item.tags} />
        </>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          style={styles.actionBtn}
          onPress={() => togglePin(item.id)}>
          <Text style={styles.actionText}>
            {item.isPinned ? '取消置顶' : '置顶'}
          </Text>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => navigation.navigate('AddItem', { itemId: item.id })}>
          <Text style={styles.actionText}>编辑</Text>
        </Pressable>
        <Pressable style={styles.dangerBtn} onPress={confirmDelete}>
          <Text style={styles.dangerText}>删除</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  missing: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 280,
    borderRadius: radius.md,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  name: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  pinBadge: {
    fontSize: 12,
    color: colors.pin,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  actionBtn: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  actionText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  dangerBtn: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
  },
  dangerText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 16,
  },
});
