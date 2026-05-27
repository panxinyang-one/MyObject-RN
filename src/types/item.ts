export type Item = {
  id: string;
  name: string;
  location: string;
  note: string;
  imageUri: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
};

export type RootStackParamList = {
  Home: undefined;
  AddItem: { itemId?: string } | undefined;
  ItemDetail: { itemId: string };
  Settings: undefined;
  Login: undefined;
  Register: undefined;
};
