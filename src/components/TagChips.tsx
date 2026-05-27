import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../constants/theme';

type Props = {
  tags: string[];
  selected?: string | null;
  onSelect?: (tag: string | null) => void;
  compact?: boolean;
};

export function TagChips({ tags, selected, onSelect, compact }: Props) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {onSelect ? (
        <Pressable
          style={[styles.chip, !selected && styles.chipActive]}
          onPress={() => onSelect(null)}>
          <Text style={[styles.text, !selected && styles.textActive]}>全部</Text>
        </Pressable>
      ) : null}
      {tags.map(tag => {
        const active = selected === tag;
        return (
          <Pressable
            key={tag}
            style={[styles.chip, active && styles.chipActive, compact && styles.chipCompact]}
            onPress={() => onSelect?.(active ? null : tag)}
            disabled={!onSelect}>
            <Text style={[styles.text, active && styles.textActive]}>{tag}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipCompact: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    color: colors.chipText,
    fontSize: 13,
  },
  textActive: {
    color: '#fff',
  },
});
