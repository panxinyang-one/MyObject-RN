/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ItemCard } from '../src/components/ItemCard';
import { MOCK_ITEMS } from '../src/data/mockItems';
import { filterItems } from '../src/utils/itemFilters';

test('filterItems matches name keyword', () => {
  const result = filterItems(MOCK_ITEMS, '充电', null);
  expect(result.some(i => i.name.includes('充电'))).toBe(true);
});

test('ItemCard renders item name', () => {
  let tree: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <ItemCard item={MOCK_ITEMS[0]} onPress={() => {}} />,
    );
  });
  const json = tree!.toJSON();
  expect(JSON.stringify(json)).toContain(MOCK_ITEMS[0].name);
});
