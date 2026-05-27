import type { Item } from '../types/item';

const RECENT_LIMIT = 3;

export function filterItems(
  items: Item[],
  query: string,
  tagFilter: string | null,
): Item[] {
  const q = query.trim().toLowerCase();
  return items.filter(item => {
    if (tagFilter && !item.tags.includes(tagFilter)) {
      return false;
    }
    if (!q) {
      return true;
    }
    const haystack = [
      item.name,
      item.location,
      item.note,
      ...item.tags,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function getPinnedItems(items: Item[]): Item[] {
  return items.filter(i => i.isPinned);
}

export function getRecentItems(items: Item[], excludeIds: Set<string>): Item[] {
  return [...items]
    .filter(i => !excludeIds.has(i.id))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, RECENT_LIMIT);
}

export function getAllTags(items: Item[]): string[] {
  const set = new Set<string>();
  items.forEach(i => i.tags.forEach(t => set.add(t)));
  return Array.from(set).sort();
}
