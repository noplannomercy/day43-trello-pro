# Trello Pro - Backend API Curl Test Manual

## 목차
1. [환경 설정](#환경-설정)
2. [Phase A1: P0 Backend 테스트](#phase-a1-p0-backend-테스트)
3. [Phase A2: P1 Backend 테스트](#phase-a2-p1-backend-테스트)
4. [Phase A3: P2 Backend 테스트](#phase-a3-p2-backend-테스트)
5. [Activity Log 확인](#activity-log-확인)
6. [체크리스트](#체크리스트)

---

## 환경 설정

### 1. 개발 서버 실행
```bash
npm run dev
```
서버가 http://localhost:3000에서 실행됩니다.

### 2. 세션 토큰 획득

#### 방법 1: Google OAuth 로그인 (권장)
1. 브라우저에서 http://localhost:3000/login 접속
2. Google 계정으로 로그인
3. 개발자 도구 (F12) → Application/Storage → Cookies
4. `next-auth.session-token` 쿠키 값 복사

#### 방법 2: 임시 인증 비활성화 (테스트용)
`src/lib/api-utils.ts`의 `requireAuth()` 함수를 임시로 수정:
```typescript
export async function requireAuth() {
  // 테스트용 임시 사용자 반환
  return { id: 'test-user-id', email: 'test@example.com' };
}
```

### 3. 환경 변수 설정 (PowerShell)
```powershell
# 세션 토큰 설정
$SESSION_TOKEN = "your-session-token-here"

# 또는 인증 비활성화 시
$SESSION_TOKEN = "dummy"
```

### 4. 테스트용 변수 초기화
```powershell
# 테스트 중 생성된 ID를 저장할 변수들
$BOARD_ID = ""
$LIST_ID_1 = ""
$LIST_ID_2 = ""
$CARD_ID = ""
$LABEL_ID = ""
$USER_ID = ""
```

---

## Phase A1: P0 Backend 테스트

### 1. Boards API

#### 1.1 보드 생성 (POST /api/boards)
```powershell
curl -X POST http://localhost:3000/api/boards `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"My First Board\",\"background\":\"#3b82f6\"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "board-id-xxx",
    "title": "My First Board",
    "background": "#3b82f6",
    "ownerId": "user-id-xxx",
    "createdAt": "2026-02-05T...",
    "updatedAt": "2026-02-05T..."
  }
}
```

**Action:** 응답에서 `id` 값을 복사하여 `$BOARD_ID`에 저장
```powershell
$BOARD_ID = "board-id-xxx"  # 실제 값으로 교체
```

#### 1.2 보드 목록 조회 (GET /api/boards)
```powershell
curl http://localhost:3000/api/boards `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "board-id-xxx",
      "title": "My First Board",
      "background": "#3b82f6",
      "cardCount": 0,
      ...
    }
  ]
}
```

#### 1.3 보드 상세 조회 (GET /api/boards/[id])
```powershell
curl http://localhost:3000/api/boards/$BOARD_ID `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

#### 1.4 보드 수정 (PATCH /api/boards/[id])
```powershell
curl -X PATCH http://localhost:3000/api/boards/$BOARD_ID `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"Updated Board Title\",\"background\":\"#10b981\"}'
```

---

### 2. Lists API

#### 2.1 리스트 생성 - To Do (POST /api/lists)
```powershell
curl -X POST http://localhost:3000/api/lists `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"title\":\"To Do\",\"boardId\":\"$BOARD_ID\"}"
```

**Action:** 응답에서 `id` 값을 `$LIST_ID_1`에 저장
```powershell
$LIST_ID_1 = "list-id-xxx"  # 실제 값으로 교체
```

#### 2.2 리스트 생성 - In Progress (POST /api/lists)
```powershell
curl -X POST http://localhost:3000/api/lists `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"title\":\"In Progress\",\"boardId\":\"$BOARD_ID\"}"
```

**Action:** 응답에서 `id` 값을 `$LIST_ID_2`에 저장
```powershell
$LIST_ID_2 = "list-id-xxx"  # 실제 값으로 교체
```

#### 2.3 리스트 수정 (PATCH /api/lists/[id])
```powershell
curl -X PATCH http://localhost:3000/api/lists/$LIST_ID_1 `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"Backlog\"}'
```

#### 2.4 리스트 위치 변경 (PATCH /api/lists/[id])
```powershell
curl -X PATCH http://localhost:3000/api/lists/$LIST_ID_1 `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"position\":1}'
```

---

### 3. Cards API

#### 3.1 카드 생성 (POST /api/cards)
```powershell
curl -X POST http://localhost:3000/api/cards `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"title\":\"Fix login bug\",\"description\":\"Users cannot login with Google\",\"listId\":\"$LIST_ID_1\"}"
```

**Action:** 응답에서 `id` 값을 `$CARD_ID`에 저장
```powershell
$CARD_ID = "card-id-xxx"  # 실제 값으로 교체
```

#### 3.2 카드 상세 조회 (GET /api/cards/[id])
```powershell
curl http://localhost:3000/api/cards/$CARD_ID `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

**Expected Response:** 카드 정보 + 연관된 labels, members, activities 포함

#### 3.3 카드 수정 (PATCH /api/cards/[id])
```powershell
curl -X PATCH http://localhost:3000/api/cards/$CARD_ID `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"Fix Google OAuth login bug\",\"description\":\"Updated description\"}'
```

#### 3.4 카드 이동 - 다른 리스트로 (PATCH /api/cards/[id])
```powershell
curl -X PATCH http://localhost:3000/api/cards/$CARD_ID `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"listId\":\"$LIST_ID_2\",\"position\":0}"
```

**Expected:** `card_moved` activity가 자동으로 로깅됨

#### 3.5 카드 위치 변경 - 같은 리스트 내 (PATCH /api/cards/[id])
```powershell
curl -X PATCH http://localhost:3000/api/cards/$CARD_ID `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"position\":1}'
```

---

## Phase A2: P1 Backend 테스트

### 4. Labels API

#### 4.1 라벨 생성 - Bug (POST /api/labels)
```powershell
curl -X POST http://localhost:3000/api/labels `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Bug\",\"color\":\"red\",\"boardId\":\"$BOARD_ID\"}"
```

**Action:** 응답에서 `id` 값을 `$LABEL_ID`에 저장
```powershell
$LABEL_ID = "label-id-xxx"  # 실제 값으로 교체
```

#### 4.2 라벨 생성 - Feature (POST /api/labels)
```powershell
curl -X POST http://localhost:3000/api/labels `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Feature\",\"color\":\"green\",\"boardId\":\"$BOARD_ID\"}"
```

#### 4.3 라벨 생성 - Enhancement (POST /api/labels)
```powershell
curl -X POST http://localhost:3000/api/labels `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Enhancement\",\"color\":\"blue\",\"boardId\":\"$BOARD_ID\"}"
```

#### 4.4 보드의 라벨 목록 조회 (GET /api/labels?boardId=xxx)
```powershell
curl "http://localhost:3000/api/labels?boardId=$BOARD_ID" `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "label-id-1",
      "name": "Bug",
      "color": "red",
      "boardId": "board-id-xxx",
      "createdAt": "..."
    },
    ...
  ]
}
```

#### 4.5 라벨 수정 (PATCH /api/labels/[id])
```powershell
curl -X PATCH http://localhost:3000/api/labels/$LABEL_ID `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Critical Bug\",\"color\":\"purple\"}'
```

#### 4.6 잘못된 색상으로 라벨 생성 시도 (실패 테스트)
```powershell
curl -X POST http://localhost:3000/api/labels `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Invalid\",\"color\":\"rainbow\",\"boardId\":\"$BOARD_ID\"}"
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid color. Must be one of: red, orange, yellow, green, blue, purple, pink, gray, brown, black"
  }
}
```

---

### 5. Card Labels API

#### 5.1 카드에 라벨 할당 (POST /api/cards/[id]/labels)
```powershell
curl -X POST http://localhost:3000/api/cards/$CARD_ID/labels `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"labelId\":\"$LABEL_ID\"}"
```

**Expected:** `label_added` activity가 자동으로 로깅됨

#### 5.2 같은 라벨 중복 할당 시도 (실패 테스트)
```powershell
curl -X POST http://localhost:3000/api/cards/$CARD_ID/labels `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"labelId\":\"$LABEL_ID\"}"
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Label already assigned to this card"
  }
}
```

#### 5.3 카드에서 라벨 제거 (DELETE /api/cards/[id]/labels?labelId=xxx)
```powershell
curl -X DELETE "http://localhost:3000/api/cards/$CARD_ID/labels?labelId=$LABEL_ID" `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

**Expected:** `label_removed` activity가 자동으로 로깅됨

---

### 6. Due Dates API

#### 6.1 카드에 마감일 설정 (PATCH /api/cards/[id])
```powershell
# 5일 후 마감일 설정 (녹색 표시 예상)
curl -X PATCH http://localhost:3000/api/cards/$CARD_ID `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"dueDate\":\"2026-02-10T10:00:00Z\"}'
```

**Expected:** `due_date_set` activity가 자동으로 로깅됨

#### 6.2 마감일 변경 (PATCH /api/cards/[id])
```powershell
# 내일로 변경 (노란색 표시 예상)
curl -X PATCH http://localhost:3000/api/cards/$CARD_ID `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"dueDate\":\"2026-02-06T10:00:00Z\"}'
```

#### 6.3 마감일 제거 (PATCH /api/cards/[id])
```powershell
curl -X PATCH http://localhost:3000/api/cards/$CARD_ID `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"dueDate\":null}'
```

**Expected:** `due_date_removed` activity가 자동으로 로깅됨

---

## Phase A3: P2 Backend 테스트

### 7. Board Members API

#### 7.1 두 번째 사용자 생성
두 번째 Google 계정으로 로그인하여 사용자 생성 필요.
- 이메일 예: `member@example.com`
- 로그인 후 사용자 ID 확인 필요

**임시 방법:** DB에 직접 사용자 추가
```sql
INSERT INTO users (id, email, name, image, created_at, updated_at)
VALUES ('test-user-2', 'member@example.com', 'Test Member', NULL, datetime('now'), datetime('now'));
```

```powershell
$MEMBER_EMAIL = "member@example.com"
```

#### 7.2 보드에 멤버 초대 (POST /api/boards/[id]/members)
```powershell
curl -X POST http://localhost:3000/api/boards/$BOARD_ID/members `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"$MEMBER_EMAIL\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "board-member-id-xxx",
    "boardId": "board-id-xxx",
    "userId": "user-id-2",
    "role": "member",
    "joinedAt": "...",
    "user": {
      "id": "user-id-2",
      "email": "member@example.com",
      "name": "Test Member"
    }
  }
}
```

**Action:** 응답에서 `userId` 값을 `$USER_ID`에 저장
```powershell
$USER_ID = "user-id-2"  # 실제 값으로 교체
```

#### 7.3 보드 멤버 목록 조회 (GET /api/boards/[id]/members)
```powershell
curl http://localhost:3000/api/boards/$BOARD_ID/members `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

#### 7.4 존재하지 않는 사용자 초대 시도 (실패 테스트)
```powershell
curl -X POST http://localhost:3000/api/boards/$BOARD_ID/members `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"nonexistent@example.com\"}'
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found. The user must have an account to be invited."
  }
}
```

---

### 8. Card Members API

#### 8.1 카드에 멤버 할당 (POST /api/cards/[id]/members)
```powershell
curl -X POST http://localhost:3000/api/cards/$CARD_ID/members `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d "{\"userId\":\"$USER_ID\"}"
```

**Expected:** `member_assigned` activity가 자동으로 로깅됨

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "card-member-id-xxx",
    "cardId": "card-id-xxx",
    "userId": "user-id-2",
    "assignedAt": "...",
    "user": {
      "id": "user-id-2",
      "email": "member@example.com",
      "name": "Test Member"
    }
  }
}
```

#### 8.2 보드 멤버가 아닌 사용자 할당 시도 (실패 테스트)
```powershell
# 먼저 다른 사용자 ID가 필요 (예: "other-user-id")
curl -X POST http://localhost:3000/api/cards/$CARD_ID/members `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"userId\":\"other-user-id\"}'
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_USER",
    "message": "User must be a board member to be assigned to cards"
  }
}
```

#### 8.3 카드에서 멤버 제거 (DELETE /api/cards/[id]/members?userId=xxx)
```powershell
curl -X DELETE "http://localhost:3000/api/cards/$CARD_ID/members?userId=$USER_ID" `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

**Expected:** `member_unassigned` activity가 자동으로 로깅됨

---

### 9. Board Member Removal API

#### 9.1 보드에서 멤버 제거 (DELETE /api/boards/[id]/members/[userId])
```powershell
curl -X DELETE http://localhost:3000/api/boards/$BOARD_ID/members/$USER_ID `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

**Expected:**
- boardMember 삭제
- 해당 사용자가 할당된 모든 카드에서 자동 제거

#### 9.2 보드 소유자 제거 시도 (실패 테스트)
```powershell
# OWNER_ID를 현재 사용자 ID로 설정
curl -X DELETE http://localhost:3000/api/boards/$BOARD_ID/members/$OWNER_ID `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_OPERATION",
    "message": "Cannot remove the board owner"
  }
}
```

---

## Activity Log 확인

### 10. Activities API

#### 10.1 보드의 모든 활동 조회 (GET /api/activities?boardId=xxx)
```powershell
curl "http://localhost:3000/api/activities?boardId=$BOARD_ID" `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "activity-id-1",
      "boardId": "board-id-xxx",
      "cardId": "card-id-xxx",
      "userId": "user-id-xxx",
      "action": "card_moved",
      "details": "{\"fromListId\":\"list-id-1\",\"toListId\":\"list-id-2\"}",
      "createdAt": "...",
      "user": {
        "id": "user-id-xxx",
        "name": "Test User",
        "email": "test@example.com",
        "image": null
      },
      "card": {
        "id": "card-id-xxx",
        "title": "Fix Google OAuth login bug"
      }
    },
    ...
  ]
}
```

#### 10.2 카드의 활동 조회 (GET /api/activities?cardId=xxx)
```powershell
curl "http://localhost:3000/api/activities?cardId=$CARD_ID" `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

**Expected:** 해당 카드와 관련된 모든 활동 로그 반환
- card_created
- label_added / label_removed
- member_assigned / member_unassigned
- due_date_set / due_date_removed
- description_updated
- card_moved
- card_updated

---

## 삭제 테스트

### 11. Cascade Delete 테스트

#### 11.1 라벨 삭제 (DELETE /api/labels/[id])
```powershell
curl -X DELETE http://localhost:3000/api/labels/$LABEL_ID `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

**Expected:**
- label 삭제
- cardLabels 자동 삭제 (cascade)

#### 11.2 카드 삭제 (DELETE /api/cards/[id])
```powershell
curl -X DELETE http://localhost:3000/api/cards/$CARD_ID `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

**Expected:**
- `card_deleted` activity 로깅
- card 삭제
- cardLabels, cardMembers, activities 자동 삭제 (cascade)

#### 11.3 리스트 삭제 (DELETE /api/lists/[id])
```powershell
curl -X DELETE http://localhost:3000/api/lists/$LIST_ID_1 `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

**Expected:**
- `list_deleted` activity 로깅
- list 삭제
- 해당 리스트의 모든 cards 자동 삭제 (cascade)

#### 11.4 보드 삭제 (DELETE /api/boards/[id])
```powershell
curl -X DELETE http://localhost:3000/api/boards/$BOARD_ID `
  -H "Cookie: next-auth.session-token=$SESSION_TOKEN"
```

**Expected:**
- board 삭제
- 모든 lists, cards, labels, boardMembers, activities 자동 삭제 (cascade)

---

## 체크리스트

### Phase A1: P0 Backend
- [ ] Create board returns 201 with board data
- [ ] List boards shows user's boards only
- [ ] Update board title succeeds
- [ ] Delete board removes board and cascades to lists/cards
- [ ] Create list sets correct position
- [ ] Update list title/position works
- [ ] Delete list cascades to cards
- [ ] Create card sets correct position
- [ ] Update card (title, description, listId, position) works
- [ ] Get card details includes all fields
- [ ] Delete card succeeds
- [ ] Non-owner cannot modify board/list/card (403 error)
- [ ] Invalid input returns 400 with validation errors

### Phase A2: P1 Backend
- [ ] Create label with valid color succeeds
- [ ] Create label with invalid color returns 400
- [ ] List labels returns only board's labels
- [ ] Update label name/color works
- [ ] Delete label cascades to cardLabels
- [ ] Assign label to card creates cardLabel
- [ ] Assign same label twice returns 409 (conflict)
- [ ] Remove label from card works
- [ ] Set due date on card works
- [ ] Get card includes labels and dueDate

### Phase A3: P2 Backend
- [ ] Invite member adds boardMember
- [ ] Non-owner cannot invite members (403)
- [ ] Remove member deletes boardMember and unassigns from cards
- [ ] Assign member to card works (must be board member)
- [ ] Cannot assign non-board-member to card (400)
- [ ] Unassign member from card works
- [ ] Get activities returns chronological list with user data
- [ ] Activity details JSON contains relevant info

### Activity Logging
- [ ] board_created logged when board is created
- [ ] board_updated logged when board is updated
- [ ] list_created logged when list is created
- [ ] list_updated logged when list is updated
- [ ] list_deleted logged when list is deleted
- [ ] card_created logged when card is created
- [ ] card_updated logged when card is updated
- [ ] card_deleted logged when card is deleted
- [ ] card_moved logged when card moves between lists
- [ ] description_updated logged when description changes
- [ ] due_date_set logged when due date is set
- [ ] due_date_removed logged when due date is removed
- [ ] label_added logged when label is assigned
- [ ] label_removed logged when label is removed
- [ ] member_assigned logged when member is assigned
- [ ] member_unassigned logged when member is unassigned

---

## 참고사항

### HTTP 상태 코드
- `200`: 성공 (GET, PATCH, DELETE)
- `201`: 생성 성공 (POST)
- `400`: 잘못된 요청 (Validation Error)
- `401`: 인증 실패 (Unauthorized)
- `403`: 권한 없음 (Forbidden)
- `404`: 리소스 없음 (Not Found)
- `409`: 충돌 (Conflict - 중복 등)
- `500`: 서버 오류

### 응답 포맷
모든 API는 다음 포맷으로 응답합니다:

**성공:**
```json
{
  "success": true,
  "data": { ... }
}
```

**실패:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

### 유효한 라벨 색상
`red`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `gray`, `brown`, `black`

### 마감일 색상 코딩 (Frontend에서 구현 예정)
- **Green**: 2일 이상 남음
- **Yellow**: 1-2일 남음
- **Red**: 24시간 이내 또는 지남

---

**테스트 완료 날짜:** _______________
**테스트 수행자:** _______________
**비고:** _______________
