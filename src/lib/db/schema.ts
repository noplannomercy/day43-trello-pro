import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users table (NextAuth compatible + app fields)
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'timestamp' }),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Accounts table (for OAuth - NextAuth)
export const accounts = sqliteTable('accounts', {
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table) => ({
  pk: uniqueIndex('accounts_pk').on(table.provider, table.providerAccountId),
}));

// Sessions table (NextAuth)
export const sessions = sqliteTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

// Verification tokens table (NextAuth)
export const verificationTokens = sqliteTable('verification_token', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
}, (table) => ({
  pk: uniqueIndex('verification_token_pk').on(table.identifier, table.token),
}));

// Boards table
export const boards = sqliteTable('boards', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  background: text('background'),
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  ownerIdx: index('boards_owner_idx').on(table.ownerId),
  updatedIdx: index('boards_updated_idx').on(table.updatedAt),
}));

// Lists table
export const lists = sqliteTable('lists', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  boardId: text('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  boardPosIdx: index('lists_board_pos_idx').on(table.boardId, table.position),
}));

// Cards table
export const cards = sqliteTable('cards', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description'),
  listId: text('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  listPosIdx: index('cards_list_pos_idx').on(table.listId, table.position),
  dueDateIdx: index('cards_due_date_idx').on(table.dueDate),
}));

// Labels table (P1)
export const labels = sqliteTable('labels', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  color: text('color').notNull(),
  boardId: text('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  boardIdx: index('labels_board_idx').on(table.boardId),
}));

// CardLabels table (P1)
export const cardLabels = sqliteTable('card_labels', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  cardId: text('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  labelId: text('label_id').notNull().references(() => labels.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  cardLabelIdx: uniqueIndex('card_labels_card_label_idx').on(table.cardId, table.labelId),
  labelIdx: index('card_labels_label_idx').on(table.labelId),
}));

// BoardMembers table (P2)
export const boardMembers = sqliteTable('board_members', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  boardId: text('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'), // 'owner' | 'member'
  joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  boardUserIdx: uniqueIndex('board_members_board_user_idx').on(table.boardId, table.userId),
  userIdx: index('board_members_user_idx').on(table.userId),
}));

// CardMembers table (P2)
export const cardMembers = sqliteTable('card_members', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  cardId: text('card_id').notNull().references(() => cards.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  assignedAt: integer('assigned_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  cardUserIdx: uniqueIndex('card_members_card_user_idx').on(table.cardId, table.userId),
  userIdx: index('card_members_user_idx').on(table.userId),
}));

// Activities table (P2)
export const activities = sqliteTable('activities', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  cardId: text('card_id').references(() => cards.id, { onDelete: 'cascade' }),
  boardId: text('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  details: text('details'), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  boardIdx: index('activities_board_idx').on(table.boardId),
  cardIdx: index('activities_card_idx').on(table.cardId),
  createdIdx: index('activities_created_idx').on(table.createdAt),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  boards: many(boards),
  boardMembers: many(boardMembers),
  cardMembers: many(cardMembers),
  activities: many(activities),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
  owner: one(users, {
    fields: [boards.ownerId],
    references: [users.id],
  }),
  lists: many(lists),
  labels: many(labels),
  boardMembers: many(boardMembers),
  activities: many(activities),
}));

export const listsRelations = relations(lists, ({ one, many }) => ({
  board: one(boards, {
    fields: [lists.boardId],
    references: [boards.id],
  }),
  cards: many(cards),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  list: one(lists, {
    fields: [cards.listId],
    references: [lists.id],
  }),
  cardLabels: many(cardLabels),
  cardMembers: many(cardMembers),
  activities: many(activities),
}));

export const labelsRelations = relations(labels, ({ one, many }) => ({
  board: one(boards, {
    fields: [labels.boardId],
    references: [boards.id],
  }),
  cardLabels: many(cardLabels),
}));

export const cardLabelsRelations = relations(cardLabels, ({ one }) => ({
  card: one(cards, {
    fields: [cardLabels.cardId],
    references: [cards.id],
  }),
  label: one(labels, {
    fields: [cardLabels.labelId],
    references: [labels.id],
  }),
}));

export const boardMembersRelations = relations(boardMembers, ({ one }) => ({
  board: one(boards, {
    fields: [boardMembers.boardId],
    references: [boards.id],
  }),
  user: one(users, {
    fields: [boardMembers.userId],
    references: [users.id],
  }),
}));

export const cardMembersRelations = relations(cardMembers, ({ one }) => ({
  card: one(cards, {
    fields: [cardMembers.cardId],
    references: [cards.id],
  }),
  user: one(users, {
    fields: [cardMembers.userId],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  card: one(cards, {
    fields: [activities.cardId],
    references: [cards.id],
  }),
  board: one(boards, {
    fields: [activities.boardId],
    references: [boards.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));
