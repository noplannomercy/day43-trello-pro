# Requirements Specification - Trello Pro

## Overview
This document consolidates all functional and non-functional requirements for the Trello Pro project management service.

## 1. Functional Requirements

### 1.1 Authentication & User Management (P0)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-1.1 | Google OAuth Login | P0 | User can log in with Google account via NextAuth |
| FR-1.2 | Session Management | P0 | User session persists across browser sessions; logout functionality available |
| FR-1.3 | User Profile | P0 | Display user name, email, and profile image from Google account |

### 1.2 Multi-Board Management (P0)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-2.1 | Create Board | P0 | User can create new board with name (1-100 chars) and optional background |
| FR-2.2 | View Board List | P0 | Display all user-owned boards with thumbnail, name, card count, last modified time |
| FR-2.3 | Select Board | P0 | User can click board to navigate to /board/[boardId] |
| FR-2.4 | Edit Board | P0 | Board owner can modify board name and background |
| FR-2.5 | Delete Board | P0 | Board owner can delete board with confirmation; deletes all lists/cards |

### 1.3 List Management (P0)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-3.1 | Create List | P0 | User can create list with title (1-100 chars); added to right end |
| FR-3.2 | Edit List | P0 | Click list title to edit inline |
| FR-3.3 | Delete List | P0 | Delete list with confirmation; removes all contained cards |
| FR-3.4 | Reorder Lists | P0 | Drag and drop lists to change order using @dnd-kit |

### 1.4 Card Management (P0)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-4.1 | Create Card | P0 | User can create card with title (1-200 chars) and optional description |
| FR-4.2 | View Card Details | P0 | Click card to show side panel with all card information |
| FR-4.3 | Edit Card | P0 | User can modify card title, description, labels, due date, members |
| FR-4.4 | Delete Card | P0 | Delete card with confirmation |
| FR-4.5 | Move Card | P0 | Drag and drop card within list or to other lists using @dnd-kit |

### 1.5 Label System (P1)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-5.1 | Create Label | P1 | Create label with name (1-50 chars) and color (10 predefined colors) per board |
| FR-5.2 | View Labels | P1 | Display all labels for current board |
| FR-5.3 | Assign Label to Card | P1 | Add one or more labels to card; show label colors on card thumbnail |
| FR-5.4 | Remove Label from Card | P1 | Remove label by clicking label or X button |
| FR-5.5 | Edit Label | P1 | Modify label name or color; reflects on all cards using the label |
| FR-5.6 | Delete Label | P1 | Delete label; removes from all cards |
| FR-5.7 | Filter by Label | P1 | Click label to filter cards; support multiple label filters (OR condition) |

### 1.6 Due Date (P1)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-6.1 | Set Due Date | P1 | Set due date and optional time using date picker |
| FR-6.2 | Display Due Date | P1 | Show due date on card with color coding: green (2+ days), yellow (1-2 days), red (< 24h or overdue) |
| FR-6.3 | Edit Due Date | P1 | Click date to open date picker and modify |
| FR-6.4 | Remove Due Date | P1 | Remove due date button available |
| FR-6.5 | Sort by Due Date | P1 | Sort cards within list by due date (ascending/descending) |

### 1.7 Member Assignment (P2)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-7.1 | Invite Member | P2 | Send email invitation to add member to board |
| FR-7.2 | View Members | P2 | Display board member list with profile photo, name, email |
| FR-7.3 | Assign Member to Card | P2 | Assign one or more members to card; show member icons on card |
| FR-7.4 | Unassign Member | P2 | Remove member assignment by clicking member icon or X button |
| FR-7.5 | Filter by Member | P2 | Click member to filter cards assigned to them |
| FR-7.6 | Remove Member from Board | P2 | Board owner can remove member; unassigns from all cards |

### 1.8 Activity Log (P2)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-8.1 | Record Activity | P2 | Automatically log all changes (create/update/delete/move) with user, timestamp, action |
| FR-8.2 | View Activity | P2 | Display activity log in card detail (card-specific) and board sidebar (all board activity) |
| FR-8.3 | Filter Activity | P2 | Filter activity by member, action type, date range |

### 1.9 Side Panel (P0)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-9.1 | Card Detail Panel | P0 | Click card to open right side panel with editable title, description, labels, due date, members, activity, delete button |
| FR-9.2 | Close Panel | P0 | Close panel by clicking outside, X button, or ESC key |

### 1.10 Dark Mode (P0)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-10.1 | Theme Toggle | P0 | Toggle between light/dark mode; save preference locally; apply consistently across all screens |

### 1.11 Manual Save (P0)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-11.1 | Save Button | P0 | Click "Save" button to persist changes to DB; show success/failure toast message |

## 2. Non-Functional Requirements

### 2.1 Performance

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| NFR-1.1 | Page Load Time | < 2 seconds | Lighthouse |
| NFR-1.2 | Drag & Drop Responsiveness | < 100ms lag, 60 FPS | Browser DevTools |
| NFR-1.3 | Database Query Performance | < 50ms per query | Query profiling |

### 2.2 Usability

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-2.1 | Responsive Design | Support desktop (1920px-1024px) and tablet (1024px-768px); mobile excluded |
| NFR-2.2 | Intuitive UI | Clear button/action labels, icon+text combinations, consistent design system (shadcn/ui) |
| NFR-2.3 | Accessibility | Keyboard navigation (Tab/Enter/ESC), WCAG AA color contrast |

### 2.3 Security

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-3.1 | Authentication | NextAuth + Google OAuth with HTTP-only cookies |
| NFR-3.2 | Authorization | Users can only access their own boards; server-side permission checks |
| NFR-3.3 | Input Validation | Sanitize all user input; prevent XSS, SQL injection |

### 2.4 Reliability

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-4.1 | Data Integrity | SQLite ACID transactions; local DB file backup capability |
| NFR-4.2 | Error Handling | User-friendly error messages; server errors logged to console |

### 2.5 Maintainability

| ID | Requirement | Description |
|----|-------------|-------------|
| NFR-5.1 | Code Quality | TypeScript for type safety, ESLint rules, Prettier formatting |
| NFR-5.2 | Testing | E2E tests with Playwright, 90%+ coverage for core features |

## 3. User Stories by Priority

### P0 (Must Have - MVP)

1. **US-1**: As a user, I want to log in with my Google account so that I can access my boards
2. **US-2**: As a user, I want to create new boards so that I can manage multiple projects separately
3. **US-3**: As a user, I want to view and switch between boards so that I can quickly change projects
4. **US-4**: As a user, I want to add/edit/delete lists so that I can define workflow stages
5. **US-5**: As a user, I want to add/edit/delete cards so that I can track individual tasks
6. **US-6**: As a user, I want to drag and drop cards so that I can quickly update task status

### P1 (Should Have)

7. **US-7**: As a user, I want to add color labels to cards so that I can visually categorize them
8. **US-8**: As a user, I want to filter by label so that I can quickly find related tasks
9. **US-9**: As a user, I want to set due dates on cards so that I can track important deadlines
10. **US-10**: As a user, I want to see visual indicators for approaching deadlines so that I don't miss them

### P2 (Nice to Have)

11. **US-11**: As a team leader, I want to assign team members to cards so that responsibility is clear
12. **US-12**: As a team member, I want to filter cards assigned to me so that I can focus on my work
13. **US-13**: As a user, I want to view card change history so that I know what changed and when

## 4. Constraints

### 4.1 Technical Constraints
- Google account required (no other OAuth providers)
- SQLite concurrent write limitations
- Local environment only (no cloud deployment consideration)

### 4.2 Functional Constraints
- No real-time sync (manual save only)
- No mobile optimization (< 768px)
- No file attachments
- No comment system

### 4.3 Scope Constraints
- No multi-organization management
- No public board sharing
- No API provision
- No external integrations (Slack, GitHub, etc.)

## 5. Success Criteria

### Launch Criteria
- [ ] All P0 features complete and tested
- [ ] At least 2 P1 features implemented
- [ ] 90%+ E2E test pass rate
- [ ] Dark mode fully functional

### Quality Criteria
- Page load time < 2s
- Drag & drop lag < 100ms
- Zero critical bugs
