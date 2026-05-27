import type { Item } from '../types/item';

/** 阶段 A 默认假数据；设为 [] 可验证空状态 */
export const MOCK_ITEMS: Item[] = [
  {
    id: 'mock-1',
    name: '氮化镓充电器',
    location: '书桌右侧抽屉',
    note: '65W，C口，出差也会带走',
    imageUri: 'https://picsum.photos/seed/charger/400/400',
    tags: ['数码', '线材'],
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'mock-2',
    name: '校园一卡通',
    location: '床帘内侧挂钩袋',
    note: '补办过两次，别又丢了',
    imageUri: 'https://picsum.photos/seed/card/400/400',
    tags: ['证件'],
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'mock-3',
    name: '数据结构教材',
    location: '书架第二层',
    note: '期末复习要用',
    imageUri: 'https://picsum.photos/seed/book/400/400',
    tags: ['书籍'],
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'mock-4',
    name: '折叠雨伞',
    location: '衣柜门后挂钩',
    note: '',
    imageUri: 'https://picsum.photos/seed/umbrella/400/400',
    tags: ['日用品', '衣物'],
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];
