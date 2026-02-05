// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  id: string;
  title: string;
  background: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  id: string;
  title: string;
  boardId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  listId: string;
  position: number;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
  createdAt: Date;
}

export interface CardLabel {
  id: string;
  cardId: string;
  labelId: string;
  label: Label;
  createdAt: Date;
}

export interface BoardMember {
  id: string;
  boardId: string;
  userId: string;
  user?: User;
  role: 'owner' | 'member';
  joinedAt: Date;
}

export interface CardMember {
  id: string;
  cardId: string;
  userId: string;
  user?: User;
  assignedAt: Date;
}

export interface Activity {
  id: string;
  cardId: string | null;
  boardId: string;
  userId: string;
  user?: User;
  action: string;
  details: Record<string, any> | null;
  createdAt: Date;
}

export type ActivityAction =
  | 'board_created'
  | 'board_updated'
  | 'list_created'
  | 'list_updated'
  | 'list_deleted'
  | 'card_created'
  | 'card_updated'
  | 'card_deleted'
  | 'card_moved'
  | 'description_updated'
  | 'due_date_set'
  | 'due_date_removed'
  | 'label_added'
  | 'label_removed'
  | 'member_assigned'
  | 'member_unassigned';

// Extended types for API responses
export interface BoardWithDetails extends Board {
  lists: ListWithCards[];
  _count?: {
    lists: number;
    cards: number;
  };
}

export interface ListWithCards extends List {
  cards: CardWithDetails[];
}

export interface CardWithDetails extends Card {
  labels?: CardLabel[];
  members?: CardMember[];
  activities?: Activity[];
}

export interface BoardWithMembers extends Board {
  members?: BoardMember[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}
