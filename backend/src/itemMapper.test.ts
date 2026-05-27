import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { rowToApiItem, toPublicImageUri } from './utils/itemMapper';
import type { ItemRow } from './types';

describe('itemMapper', () => {
  it('toPublicImageUri prefixes relative upload path', () => {
    process.env.PUBLIC_BASE_URL = 'http://localhost:3000';
    assert.equal(
      toPublicImageUri('/uploads/a.jpg'),
      'http://localhost:3000/uploads/a.jpg',
    );
  });

  it('rowToApiItem maps db row', () => {
    const row = {
      id: 1,
      user_id: 2,
      name: '充电器',
      location: '书桌',
      note: null,
      image_url: '/uploads/x.jpg',
      tags_json: '["数码"]',
      is_pinned: 1,
      created_at: new Date('2025-01-01T00:00:00.000Z'),
      updated_at: new Date('2025-01-02T00:00:00.000Z'),
    } as ItemRow;
    const item = rowToApiItem(row);
    assert.equal(item.id, '1');
    assert.equal(item.isPinned, true);
    assert.deepEqual(item.tags, ['数码']);
  });
});
