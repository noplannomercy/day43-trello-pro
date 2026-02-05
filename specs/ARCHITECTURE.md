# Architecture Specification - Trello Pro

## 1. System Overview

### 1.1 Architecture Pattern
Trello Pro follows a **monolithic Next.js architecture** with server-side rendering and API routes.

### 1.2 Technology Stack

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Next.js 15 App Router]
        B[React Components]
        C[shadcn/ui]
        D[@dnd-kit]
    end

    subgraph "Backend Layer"
        E[Next.js API Routes]
        F[NextAuth]
        G[Server Actions]
    end

    subgraph "Data Layer"
        H[Drizzle ORM]
        I[SQLite Database]
    end

    subgraph "External Services"
        J[Google OAuth]
    end

    A --> B
    B --> C
    B --> D
    A --> E
    A --> G
    E --> F
    F --> J
    E --> H
    G --> H
    H --> I
```

## 2. System Architecture

### 2.1 High-Level Architecture

```mermaid
graph LR
    subgraph "Client Browser"
        UI[React UI Components]
        State[Client State]
    end

    subgraph "Next.js Server"
        Router[App Router]
        API[API Routes]
        Auth[NextAuth Middleware]
        SA[Server Actions]
    end

    subgraph "Data"
        ORM[Drizzle ORM]
        DB[(SQLite)]
    end

    subgraph "External"
        Google[Google OAuth]
    end

    UI --> Router
    UI --> API
    UI --> SA
    Router --> Auth
    API --> Auth
    Auth --> Google
    API --> ORM
    SA --> ORM
    ORM --> DB
    State -.-> UI
```

### 2.2 Layer Responsibilities

#### Frontend Layer
- **Responsibility**: User interface, client-side state, user interactions
- **Components**:
  - React components (pages, UI components)
  - Client-side routing (Next.js App Router)
  - State management (React hooks, Context API)
  - Drag & drop interactions (@dnd-kit)
  - UI library (shadcn/ui)

#### Backend Layer
- **Responsibility**: Business logic, authentication, data access
- **Components**:
  - API routes (REST endpoints)
  - Server actions (form submissions, mutations)
  - NextAuth (authentication/authorization)
  - Middleware (auth checks, request validation)

#### Data Layer
- **Responsibility**: Data persistence, queries, migrations
- **Components**:
  - Drizzle ORM (type-safe queries)
  - SQLite database (local file storage)
  - Migration management (Drizzle Kit)

## 3. Component Architecture

### 3.1 Application Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/
│   │   └── login/          # Login page
│   ├── (dashboard)/
│   │   ├── page.tsx        # Board list (/)
│   │   └── board/
│   │       └── [id]/       # Board detail (/board/[id])
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth
│   │   ├── boards/         # Board endpoints
│   │   ├── lists/          # List endpoints
│   │   ├── cards/          # Card endpoints
│   │   ├── labels/         # Label endpoints (P1)
│   │   └── members/        # Member endpoints (P2)
│   └── layout.tsx          # Root layout
├── components/             # React components
│   ├── ui/                 # shadcn/ui base components
│   ├── board/              # Board-related components
│   ├── card/               # Card-related components
│   ├── sidebar/            # Side panel components
│   └── shared/             # Shared components
├── lib/                    # Utilities
│   ├── db/                 # Drizzle schema & queries
│   ├── auth.ts             # NextAuth config
│   └── utils.ts            # Helper functions
└── types/                  # TypeScript types
```

### 3.2 Component Hierarchy

```mermaid
graph TD
    Root[Root Layout] --> Auth{Authenticated?}
    Auth -->|No| Login[Login Page]
    Auth -->|Yes| Dashboard[Dashboard Layout]

    Dashboard --> BoardList[Board List Page]
    Dashboard --> BoardPage[Board Page]

    BoardList --> BoardCard[Board Card Component]
    BoardList --> CreateBoardModal[Create Board Modal]

    BoardPage --> BoardHeader[Board Header]
    BoardPage --> ListsContainer[Lists Container]
    BoardPage --> CardDetailPanel[Card Detail Side Panel]

    BoardHeader --> BoardTitle[Board Title]
    BoardHeader --> MemberIcons[Member Icons - P2]
    BoardHeader --> FilterButtons[Filter Buttons - P1]
    BoardHeader --> SaveButton[Save Button]

    ListsContainer --> List[List Component]
    List --> ListHeader[List Header]
    List --> CardList[Card List]
    List --> AddCardButton[Add Card Button]

    CardList --> Card[Card Component]
    Card --> CardTitle[Card Title]
    Card --> CardLabels[Card Labels - P1]
    Card --> CardDueDate[Card Due Date - P1]
    Card --> CardMembers[Card Members - P2]

    CardDetailPanel --> CardTitle2[Editable Title]
    CardDetailPanel --> CardDescription[Editable Description]
    CardDetailPanel --> LabelSection[Label Section - P1]
    CardDetailPanel --> DueDateSection[Due Date Section - P1]
    CardDetailPanel --> MemberSection[Member Section - P2]
    CardDetailPanel --> ActivityLog[Activity Log - P2]
```

## 4. Data Flow Architecture

### 4.1 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextAuth
    participant Google
    participant DB

    User->>Browser: Click "Login with Google"
    Browser->>NextAuth: Initiate OAuth
    NextAuth->>Google: Redirect to Google
    Google->>User: Request permission
    User->>Google: Grant permission
    Google->>NextAuth: Return OAuth token
    NextAuth->>DB: Create/update user session
    DB->>NextAuth: Session created
    NextAuth->>Browser: Redirect to dashboard
    Browser->>User: Show board list
```

### 4.2 Board Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant API
    participant ORM
    participant DB

    User->>UI: Click "Create Board"
    UI->>User: Show modal
    User->>UI: Enter board name
    UI->>API: POST /api/boards
    API->>API: Validate auth & input
    API->>ORM: Insert board
    ORM->>DB: SQL INSERT
    DB->>ORM: Board created
    ORM->>API: Return board data
    API->>UI: 201 Created + board data
    UI->>User: Redirect to new board
```

### 4.3 Card Drag & Drop Flow

```mermaid
sequenceDiagram
    participant User
    participant DnD[@dnd-kit]
    participant State[Client State]
    participant API
    participant DB

    User->>DnD: Drag card
    DnD->>State: Optimistic update
    State->>User: Show new position
    User->>DnD: Drop card
    DnD->>State: Finalize position
    State->>API: PATCH /api/cards/[id]
    API->>DB: Update position & listId
    DB->>API: Success
    API->>State: Confirm update

    Note over State,API: If API fails, rollback to previous state
```

### 4.4 Real-Time Update Strategy (Manual Save)

```mermaid
graph LR
    A[User Action] --> B{Critical Action?}
    B -->|Yes| C[Immediate Save]
    B -->|No| D[Mark Dirty]
    C --> E[API Call]
    D --> F[Wait for Save Button]
    F --> E
    E --> G{Success?}
    G -->|Yes| H[Update UI]
    G -->|No| I[Show Error Toast]
    I --> J[Retry Option]
```

**Critical Actions** (auto-save):
- Board create/delete
- List create/delete
- Card create/delete

**Non-Critical Actions** (manual save):
- Title/description edits
- Label changes
- Due date changes
- Position changes (after drag & drop)

## 5. API Architecture

### 5.1 API Routes Structure

```
/api/
├── auth/
│   └── [...nextauth]/      # NextAuth handlers
├── boards/
│   ├── GET                 # List boards
│   ├── POST                # Create board
│   └── [id]/
│       ├── GET             # Get board details
│       ├── PATCH           # Update board
│       └── DELETE          # Delete board
├── lists/
│   ├── POST                # Create list
│   └── [id]/
│       ├── PATCH           # Update list
│       └── DELETE          # Delete list
├── cards/
│   ├── POST                # Create card
│   └── [id]/
│       ├── GET             # Get card details
│       ├── PATCH           # Update card
│       └── DELETE          # Delete card
├── labels/                 # P1
│   ├── GET                 # List labels for board
│   ├── POST                # Create label
│   └── [id]/
│       ├── PATCH           # Update label
│       └── DELETE          # Delete label
└── members/                # P2
    ├── POST                # Invite member
    └── [id]/
        └── DELETE          # Remove member
```

### 5.2 API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-friendly message",
    "details": { ... }
  }
}
```

## 6. State Management

### 6.1 State Architecture

```mermaid
graph TB
    subgraph "Global State"
        A[Auth Context - NextAuth Session]
        B[Theme Context - Dark/Light Mode]
    end

    subgraph "Page State"
        C[Board List State]
        D[Board Page State]
    end

    subgraph "Component State"
        E[Card Detail Panel State]
        F[Modal State]
        G[Form State]
    end

    A --> C
    A --> D
    B --> C
    B --> D
    D --> E
    D --> F
    E --> G
```

### 6.2 State Management Strategy

| Scope | Method | Example |
|-------|--------|---------|
| Global | React Context | Auth session, theme preference |
| Server | Server Components | Initial data fetching |
| Page | useState + useEffect | Board data, lists, cards |
| Component | useState | Modal open/close, form inputs |
| Form | React Hook Form | Card edit form, board creation |

### 6.3 Data Fetching Strategy

```mermaid
graph LR
    A[Page Load] --> B[Server Component]
    B --> C[Fetch Initial Data]
    C --> D[Render with Data]
    D --> E[Hydrate Client]
    E --> F[Client Interactions]
    F --> G{Mutation?}
    G -->|Yes| H[API Call]
    G -->|No| I[Local State Update]
    H --> J[Revalidate]
    J --> K[Re-fetch Data]
```

## 7. Security Architecture

### 7.1 Authentication & Authorization

```mermaid
graph TB
    A[Request] --> B{Has Session?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D{Valid Session?}
    D -->|No| C
    D -->|Yes| E{Accessing Own Resource?}
    E -->|No| F[403 Forbidden]
    E -->|Yes| G[Process Request]
```

### 7.2 Security Layers

1. **Authentication Layer** (NextAuth Middleware)
   - Verify session on all protected routes
   - Refresh expired tokens

2. **Authorization Layer** (API Routes)
   - Check resource ownership
   - Validate board/card access permissions

3. **Input Validation Layer**
   - Sanitize all user inputs
   - Validate against schema (Zod)

4. **Database Layer**
   - Parameterized queries (Drizzle ORM)
   - No raw SQL from user input

## 8. Testing Architecture

### 8.1 Testing Strategy

```mermaid
graph TB
    A[Unit Tests] --> B[Component Tests]
    B --> C[Integration Tests]
    C --> D[E2E Tests]

    A1[Pure Functions] --> A
    A2[Utilities] --> A

    B1[UI Components] --> B
    B2[Hooks] --> B

    C1[API Routes] --> C
    C2[Database Queries] --> C

    D1[User Flows] --> D
    D2[Critical Paths] --> D
```

### 8.2 E2E Test Coverage (Playwright)

**P0 Test Scenarios:**
1. User login flow
2. Create board → Add list → Add card
3. Drag & drop card between lists
4. Edit card details
5. Delete card/list/board

**P1 Test Scenarios:**
6. Add label to card
7. Filter by label
8. Set due date
9. Sort by due date

**P2 Test Scenarios:**
10. Invite member
11. Assign member to card
12. View activity log

## 9. Performance Architecture

### 9.1 Optimization Strategies

| Layer | Strategy | Implementation |
|-------|----------|----------------|
| Frontend | Code splitting | Next.js automatic code splitting |
| Frontend | Image optimization | Next.js Image component |
| Frontend | Lazy loading | React.lazy for modals/panels |
| Backend | Database indexing | Index on foreign keys, user queries |
| Backend | Query optimization | Select only needed fields |
| Caching | Static generation | Board list, public pages |
| Caching | Client-side cache | React Query / SWR (optional) |

### 9.2 Performance Monitoring

```mermaid
graph LR
    A[User Action] --> B[Performance Mark]
    B --> C[Execute Action]
    C --> D[Performance Measure]
    D --> E{> Threshold?}
    E -->|Yes| F[Log Warning]
    E -->|No| G[Continue]
```

**Key Metrics:**
- Time to Interactive (TTI) < 2s
- First Contentful Paint (FCP) < 1s
- Drag & drop frame rate = 60 FPS
- API response time < 100ms

## 10. Deployment Architecture

### 10.1 Local Development

```
Developer Machine
├── Node.js Runtime
├── Next.js Dev Server (Port 3000)
├── SQLite DB File (local.db)
└── Environment Variables (.env.local)
```

### 10.2 Build Process

```mermaid
graph LR
    A[Source Code] --> B[TypeScript Compile]
    B --> C[Next.js Build]
    C --> D[Bundle & Optimize]
    D --> E[Generate Static Pages]
    E --> F[Production Build]
    F --> G[Deploy Ready]
```

## 11. Error Handling Architecture

### 11.1 Error Propagation

```mermaid
graph TB
    A[Error Occurs] --> B{Error Type?}
    B -->|Validation| C[400 Bad Request]
    B -->|Auth| D[401/403]
    B -->|Not Found| E[404]
    B -->|Server| F[500]

    C --> G[User-Friendly Message]
    D --> H[Redirect to Login]
    E --> I[Show 404 Page]
    F --> J[Generic Error + Log]

    G --> K[Toast Notification]
    I --> K
    J --> K
```

### 11.2 Error Boundaries

- **Page-level**: Catch errors in entire page
- **Component-level**: Catch errors in card panel, modals
- **Fallback UI**: Show user-friendly error message with retry option

## 12. Scalability Considerations

### 12.1 Current Limitations
- SQLite write concurrency limited
- No horizontal scaling (monolithic)
- No distributed caching

### 12.2 Future Migration Path
```mermaid
graph LR
    A[Current: SQLite] --> B[Step 1: PostgreSQL]
    B --> C[Step 2: Redis Cache]
    C --> D[Step 3: API Layer Separation]
    D --> E[Step 4: Microservices]
```

This architecture is designed for **current scope** (local, single-user focus) with **extensibility** for future growth.
