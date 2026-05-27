export type ApiItem = {
  id: string;
  name: string;
  location: string;
  note: string;
  imageUri: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
};

import type { RowDataPacket } from 'mysql2';

export type ItemRow = RowDataPacket & {
  id: number;
  user_id: number;
  name: string;
  location: string;
  note: string | null;
  image_url: string | null;
  tags_json: string | unknown;
  is_pinned: number;
  created_at: Date;
  updated_at: Date;
};

export type JwtPayload = {
  userId: number;
  email: string;
};
