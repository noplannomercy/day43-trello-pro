import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../src/lib/db/schema';

console.log('Initializing database...');

const sqlite = new Database('local.db');
const db = drizzle(sqlite, { schema });

// Create tables manually
const createTables = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER,
  image TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS accounts_pk ON accounts(provider, provider_account_id);

CREATE TABLE IF NOT EXISTS sessions (
  session_token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_token (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS verification_token_pk ON verification_token(identifier, token);

CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  background TEXT,
  owner_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS boards_owner_idx ON boards(owner_id);
CREATE INDEX IF NOT EXISTS boards_updated_idx ON boards(updated_at);

CREATE TABLE IF NOT EXISTS lists (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  board_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS lists_board_pos_idx ON lists(board_id, position);

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  list_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  due_date INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS cards_list_pos_idx ON cards(list_id, position);
CREATE INDEX IF NOT EXISTS cards_due_date_idx ON cards(due_date);

CREATE TABLE IF NOT EXISTS labels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  board_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS labels_board_idx ON labels(board_id);

CREATE TABLE IF NOT EXISTS card_labels (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  label_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS card_labels_card_label_idx ON card_labels(card_id, label_id);
CREATE INDEX IF NOT EXISTS card_labels_label_idx ON card_labels(label_id);

CREATE TABLE IF NOT EXISTS board_members (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at INTEGER NOT NULL,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS board_members_board_user_idx ON board_members(board_id, user_id);
CREATE INDEX IF NOT EXISTS board_members_user_idx ON board_members(user_id);

CREATE TABLE IF NOT EXISTS card_members (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  assigned_at INTEGER NOT NULL,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS card_members_card_user_idx ON card_members(card_id, user_id);
CREATE INDEX IF NOT EXISTS card_members_user_idx ON card_members(user_id);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  card_id TEXT,
  board_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS activities_board_idx ON activities(board_id);
CREATE INDEX IF NOT EXISTS activities_card_idx ON activities(card_id);
CREATE INDEX IF NOT EXISTS activities_created_idx ON activities(created_at);
`;

const statements = createTables.split(';').filter(s => s.trim());
for (const statement of statements) {
  if (statement.trim()) {
    sqlite.exec(statement + ';');
  }
}

console.log('Database initialized successfully!');
console.log('Tables created: users, accounts, sessions, verification_token, boards, lists, cards, labels, card_labels, board_members, card_members, activities');

sqlite.close();
