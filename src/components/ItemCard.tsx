import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';
import type { Item } from '../types/item';
import { TagChips } from './TagChips';

type Props = {
  item: Item;
  onPress: () => void;
};

export function ItemCard({ item, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: item.imageUri }} style={styles.thumb} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {item.isPinned ? <Text style={styles.pin}>置顶</Text> : null}
        </View>
        <Text style={styles.location} numberOfLines={1}>
          {item.location}
        </Text>
        <TagChips tags={item.tags} compact />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  pin: {
    fontSize: 11,
    color: colors.pin,
    fontWeight: '600',
  },
  location: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
