# Trello Pro - Implementation Guide

## Overview
Trello-like project management for small teams (1-5 people). Multi-board support, labels, due dates, member assignment, activity tracking.

## Tech Stack
Next.js 15 App Router, React, TypeScript, Tailwind, shadcn/ui, @dnd-kit, NextAuth (Google OAuth), SQLite + Drizzle ORM, Playwright

## Features by Priority
**P0 (MVP)**: Google OAuth, multi-board CRUD, list CRUD + drag/drop, card CRUD + drag/drop (within/cross-list), card detail panel, dark mode, manual save
**P1**: Labels (create/assign/filter), due dates (set/display with green/yellow/red coding), sort by due date
**P2**: Member assignment, board invitations, activity log

## Database (9 Tables)
```typescript
users: id, email, name, image, createdAt, updatedAt
boards: id, title, background, ownerId→users, createdAt, updatedAt
lists: id, title, boardId→boards, position, createdAt, updatedAt
cards: id, title, description, listId→lists, position, dueDate, createdAt, updatedAt
labels: id, name, color, boardId→boards, createdAt                                    // P1
cardLabels: id, cardId→cards, labelId→labels, createdAt                               // P1
boardMembers: id, boardId→boards, userId→users, role, joinedAt                        // P2
cardMembers: id, cardId→cards, userId→users, assignedAt                               // P2
activities: id, cardId→cards, boardId→boards, userId→users, action, details, createdAt // P2
```
**Indexes**: boards.ownerId, lists.boardId+position, cards.listId+position, cards.dueDate

## Structure
```
src/app/(auth)/login/                   # Google OAuth
src/app/(dashboard)/page.tsx            # Board list
src/app/(dashboard)/board/[id]/page.tsx # Board detail
src/app/api/{auth,boards,lists,cards,labels,members}/
src/components/{ui,board,list,card,sidebar,label,member,shared}/
src/lib/db/                             # Drizzle schema & queries
src/lib/auth.ts                         # NextAuth config
```

## Critical Decisions
1. **Monolithic Next.js** (no microservices)
2. **Manual save** (no auto-save/real-time sync)
3. **Optimistic UI updates** (rollback on error)
4. **Cascading deletes** (delete board → all lists/cards/labels/activities)
5. **0-based positions** (update in transactions)
6. **Due date colors**: green (>2d), yellow (1-2d), red (<24h/overdue)

## Key Components (40+)
**Pages**: LoginPage, BoardListPage, BoardPage
**Core (P0)**: BoardCard, CreateBoardModal, BoardHeader, List, ListHeader, AddList, CardItem, AddCard, CardDetailPanel, ThemeToggle, UserMenu
**Labels (P1)**: LabelBadge, LabelPicker, CardLabelsSection
**Members (P2)**: MemberAvatar, MemberPicker, InviteMemberModal, CardMembersSection, CardActivitySection

## API Routes
```
GET/POST /api/boards          | GET/PATCH/DELETE /api/boards/[id]
POST /api/lists               | PATCH/DELETE /api/lists/[id]
POST /api/cards               | GET/PATCH/DELETE /api/cards/[id]
GET/POST /api/labels          | PATCH/DELETE /api/labels/[id]     (P1)
POST /api/members             | DELETE /api/members/[id]           (P2)
```
**Response**: `{ success: true, data: {...} }` or `{ success: false, error: {...} }`

## Implementation Phases
**Phase 1 (P0)**: Setup (Next.js + shadcn + Drizzle + NextAuth) → Auth (Google OAuth) → Boards (list/CRUD) → Lists (CRUD + drag/drop) → Cards (CRUD + drag/drop) → Side panel → Dark mode + save
**Phase 2 (P1)**: Labels (create/assign/filter) → Due dates (picker + color coding + sort)
**Phase 3 (P2)**: Members (invite/assign/filter) → Activity log (auto-track + display)

## Performance Targets
Page load <2s, drag/drop <100ms lag (60 FPS), DB queries <50ms

## Testing
**E2E (Playwright)**: Login → Create board → Add list → Add card → Drag card → Edit card → [P1] Add label + filter + due date → [P2] Assign member + activity log

## Constraints
Google account only, local SQLite, no mobile (<768px), no real-time sync/attachments/comments

## Drizzle Quick Start
```typescript
// Schema example
export const boards = sqliteTable('boards', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (table) => ({ ownerIdx: index('boards_owner_idx').on(table.ownerId) }));

// Query example
const boards = await db.select().from(boards).where(eq(boards.ownerId, userId));
```

## Next Steps
1. `npx shadcn@latest init` (setup UI)
2. Install: `npm install drizzle-orm better-sqlite3 @dnd-kit/core @dnd-kit/sortable next-auth`
3. Setup NextAuth Google OAuth (.env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
4. Create Drizzle schema → run migrations
5. Build Phase 1 (P0) first, then P1, then P2
