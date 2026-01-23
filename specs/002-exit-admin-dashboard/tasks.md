# Tasks: EXIT Admin Dashboard MVP (Organization Model)

**Input**: Design documents from `/specs/002-exit-admin-dashboard/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md

**Tests**: Not explicitly requested in spec. Manual testing via seed data.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and base configuration

- [x] T001 Install required dependencies: prisma, @prisma/client, bcryptjs, jose, @types/bcryptjs, tsx
- [x] T002 Create environment configuration file .env with DATABASE_URL and JWT_SECRET
- [x] T003 [P] Create shared TypeScript types in src/types/index.ts (Role, AdKind, AdStatus, User, Ad, Organization interfaces)
- [x] T004 [P] Create Prisma schema in prisma/schema.prisma with Organization, User, Ad models per data-model.md
- [x] T005 Create Prisma client singleton in src/lib/prisma.ts
- [x] T006 Create seed data script in prisma/seed.ts with organization "알파", 3 users (specter/alpha/yellow), 7+ ads
- [x] T007 Configure prisma seed in package.json and run initial db push + seed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Implement JWT session utilities (sign, verify, getSession) in src/lib/auth.ts using jose
- [x] T009 [P] Implement permission checking utilities in src/lib/permissions.ts (canManageAccounts, canManageAds, getDataScope)
- [x] T010 [P] Create reusable Button component (Primary/Outline variants) in src/components/ui/Button.tsx
- [x] T011 [P] Create reusable Modal component (overlay + white box + footer buttons) in src/components/ui/Modal.tsx
- [x] T012 [P] Create Toast notification component and context provider in src/components/ui/Toast.tsx
- [x] T013 [P] Create useToast hook in src/hooks/useToast.ts
- [x] T014 Update global styles in src/app/globals.css for admin dashboard theme (green sidebar, white content area)
- [x] T015 Update root layout in src/app/layout.tsx (remove default Next.js content, add Toast provider)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - User Authentication (Priority: P1)

**Goal**: 사용자가 아이디/비밀번호로 로그인하여 권한별 대시보드에 진입하고, 로그아웃할 수 있다

**Independent Test**: specter/0000으로 로그인 시 /accounts 이동, alpha/0000으로 로그인 시 /ads 이동 확인

### Implementation for User Story 1

- [x] T016 [US1] Implement POST /api/auth/login route handler in src/app/api/auth/login/route.ts (bcrypt verify, JWT cookie set, redirect logic)
- [x] T017 [P] [US1] Implement POST /api/auth/logout route handler in src/app/api/auth/logout/route.ts (clear session cookie)
- [x] T018 [P] [US1] Implement GET /api/me route handler in src/app/api/me/route.ts (return current user from JWT)
- [x] T019 [US1] Create login page UI in src/app/login/page.tsx (username/password fields, login button, error message display)
- [x] T020 [US1] Create Sidebar component in src/components/layout/Sidebar.tsx (green background, 240px width, role-based menu items)
- [x] T021 [P] [US1] Create UserDropdown component in src/components/layout/UserDropdown.tsx (프로필 수정, 로그아웃 options)
- [x] T022 [US1] Create Header component in src/components/layout/Header.tsx (logo left, username + dropdown right, 56px height)
- [x] T023 [US1] Create protected layout in src/app/(protected)/layout.tsx (session check, redirect to /login if unauthorized, render Sidebar + Header + content)

**Checkpoint**: User Story 1 완료 - 로그인/로그아웃 및 보호된 레이아웃이 동작

---

## Phase 4: User Story 2 - Account Management (Priority: P1)

**Goal**: MASTER/AGENCY가 계정관리 페이지에서 계정 현황 조회, 등록, 수정, 삭제를 수행할 수 있다

**Independent Test**: MASTER로 로그인하여 새 AGENCY 계정 생성 후 해당 계정으로 로그인 가능

### Implementation for User Story 2

- [x] T024 [US2] Implement GET /api/accounts route handler in src/app/api/accounts/route.ts (role-based filtering, stats calculation)
- [x] T025 [P] [US2] Implement POST /api/accounts route handler in src/app/api/accounts/route.ts (create user with bcrypt, org assignment, permission check)
- [x] T026 [P] [US2] Implement PATCH /api/accounts/:id route handler in src/app/api/accounts/[id]/route.ts (update password/memo, permission check)
- [x] T027 [P] [US2] Implement DELETE /api/accounts route handler in src/app/api/accounts/route.ts (bulk delete by ids, self-delete prevention)
- [x] T028 [P] [US2] Implement GET /api/organizations route handler in src/app/api/organizations/route.ts (MASTER only, list orgs with user count)
- [x] T029 [US2] Create StatsCard component in src/components/ui/StatsCard.tsx (숫자 지표 카드, 선택 시 파란색 숫자)
- [x] T030 [P] [US2] Create Pagination component in src/components/ui/Pagination.tsx (UI only, 1 page fixed)
- [x] T031 [US2] Create AccountTable component in src/components/accounts/AccountTable.tsx (checkbox, No, 아이디, 권한 color-coded, 광고 icon, 메모, 관리 gear icon)
- [x] T032 [US2] Create AccountCreateModal component in src/components/accounts/AccountCreateModal.tsx (username, password, role select, org select for MASTER, memo fields)
- [x] T033 [US2] Create AccountEditModal component in src/components/accounts/AccountEditModal.tsx (username readonly, password required, role readonly, memo editable)
- [x] T034 [US2] Create accounts page in src/app/(protected)/accounts/page.tsx (title, stats card, table, register/delete buttons, modals integration)

**Checkpoint**: User Story 2 완료 - 계정 CRUD 및 권한별 접근 제어 동작

---

## Phase 5: User Story 3 - Ad Management (Priority: P1)

**Goal**: 사용자가 광고관리 페이지에서 광고 현황을 조회하고 상태별 필터링, 등록/수정/삭제를 수행할 수 있다

**Independent Test**: AGENCY로 로그인하여 새 광고 등록 후 "대기" 상태 숫자 증가 확인

### Implementation for User Story 3

- [x] T035 [US3] Implement GET /api/ads route handler in src/app/api/ads/route.ts (role-based filtering, stats by kind/status, query params for status/kind filter)
- [x] T036 [P] [US3] Implement POST /api/ads route handler in src/app/api/ads/route.ts (create ad, compute endDate, set status WAITING, permission check)
- [x] T037 [P] [US3] Implement PATCH /api/ads/:id route handler in src/app/api/ads/[id]/route.ts (update fields, recompute endDate if changed, permission check)
- [x] T038 [P] [US3] Implement DELETE /api/ads route handler in src/app/api/ads/route.ts (bulk delete by ids, permission check)
- [x] T039 [US3] Create AdStatusCards component in src/components/ads/AdStatusCards.tsx (전체현황, 광고현황, 테스트현황 카드 with clickable stats, single-selection across all cards)
- [x] T040 [US3] Create AdTable component in src/components/ads/AdTable.tsx (checkbox, No, 아이디, 상태, 키워드, 순위, 상품명, 프로덕트ID, 작업일수, 시작일, 종료일, 관리)
- [x] T041 [US3] Create AdCreateModal component in src/components/ads/AdCreateModal.tsx (advertiser select, kind pill toggle, quantity, workingDays, startDate, auto-computed endDate readonly)
- [x] T042 [US3] Create AdEditModal component in src/components/ads/AdEditModal.tsx (status change for MASTER/AGENCY, field editing, endDate recomputation)
- [x] T043 [US3] Create ads page in src/app/(protected)/ads/page.tsx (title, status cards, table, register/edit/delete buttons hidden for ADVERTISER, modals integration, filter state management)

**Checkpoint**: User Story 3 완료 - 광고 CRUD, 상태별 필터링, 권한별 UI 제어 동작

---

## Phase 6: User Story 4 - Profile Management (Priority: P2)

**Goal**: 로그인한 사용자가 자신의 비밀번호와 메모를 수정할 수 있다

**Independent Test**: 로그인 후 프로필에서 비밀번호 변경, 새 비밀번호로 재로그인 성공

### Implementation for User Story 4

- [ ] T044 [US4] Create profile page in src/app/(protected)/profile/page.tsx (username readonly, role readonly, password input, memo textarea, 수정 button, toast on success)

**Checkpoint**: User Story 4 완료 - 프로필 수정 기능 동작

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality checks, UI polish, and edge case handling

- [ ] T045 [P] Add middleware for session validation and redirect in src/middleware.ts (redirect unauthenticated to /login, redirect / to appropriate page)
- [ ] T046 [P] Review and match UI with reference screenshots (reference/ directory): spacing, colors, font sizes, shadows
- [ ] T047 Run TypeScript type check and fix any type errors (npx tsc --noEmit)
- [ ] T048 Run ESLint and fix any lint errors (npm run lint)
- [ ] T049 Verify full application flow: login → accounts → ads → profile → logout with all 3 seed accounts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 - Authentication is needed for all subsequent stories
- **User Story 2 (Phase 4)**: Depends on Phase 3 (needs login/layout infrastructure)
- **User Story 3 (Phase 5)**: Depends on Phase 3 (needs login/layout infrastructure), can parallel with Phase 4
- **User Story 4 (Phase 6)**: Depends on Phase 3 (needs login/layout and PATCH /api/accounts/:id from Phase 4)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Authentication)**: Foundation only - no other story dependencies
- **US2 (Accounts)**: Depends on US1 for login/layout, provides PATCH endpoint reused by US4
- **US3 (Ads)**: Depends on US1 for login/layout, independent of US2
- **US4 (Profile)**: Depends on US1 for login/layout, reuses PATCH /api/accounts/:id from US2

### Within Each User Story

- API routes before page components (data must exist before UI consumes it)
- Shared UI components (StatsCard, Table) before page-specific components
- Page components integrate all sub-components last

### Parallel Opportunities

- Phase 1: T003, T004 can run in parallel
- Phase 2: T009, T010, T011, T012, T013 can all run in parallel
- Phase 3: T017, T018 parallel; T020, T021 parallel
- Phase 4: T025, T026, T027, T028 parallel; T030 parallel with T029
- Phase 5: T036, T037, T038 parallel
- Phase 7: T045, T046 parallel

---

## Parallel Example: User Story 2

```bash
# Launch API routes in parallel (different files, independent):
Task: "Implement POST /api/accounts in src/app/api/accounts/route.ts"
Task: "Implement PATCH /api/accounts/:id in src/app/api/accounts/[id]/route.ts"
Task: "Implement DELETE /api/accounts in src/app/api/accounts/route.ts"
Task: "Implement GET /api/organizations in src/app/api/organizations/route.ts"

# After APIs are ready, launch UI components in parallel:
Task: "Create AccountCreateModal in src/components/accounts/AccountCreateModal.tsx"
Task: "Create AccountEditModal in src/components/accounts/AccountEditModal.tsx"
Task: "Create Pagination in src/components/ui/Pagination.tsx"
```

---

## Parallel Example: User Story 3

```bash
# Launch API routes in parallel:
Task: "Implement POST /api/ads in src/app/api/ads/route.ts"
Task: "Implement PATCH /api/ads/:id in src/app/api/ads/[id]/route.ts"
Task: "Implement DELETE /api/ads in src/app/api/ads/route.ts"

# After APIs, launch UI components:
Task: "Create AdStatusCards in src/components/ads/AdStatusCards.tsx"
Task: "Create AdTable in src/components/ads/AdTable.tsx"
Task: "Create AdCreateModal in src/components/ads/AdCreateModal.tsx"
Task: "Create AdEditModal in src/components/ads/AdEditModal.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (dependencies, prisma, seed)
2. Complete Phase 2: Foundational (auth utils, UI components, styles)
3. Complete Phase 3: User Story 1 (login, layout, session)
4. **STOP and VALIDATE**: Login with specter/0000 → /accounts, alpha/0000 → /ads
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Auth) → Test login/logout → MVP!
3. Add User Story 2 (Accounts) → Test CRUD with MASTER/AGENCY
4. Add User Story 3 (Ads) → Test ad management and filtering
5. Add User Story 4 (Profile) → Test password/memo change
6. Polish → Type check, lint, UI match with screenshots

### Sequential Strategy (Single Developer)

1. Phase 1 → Phase 2 → Phase 3 (Auth) → Phase 4 (Accounts) → Phase 5 (Ads) → Phase 6 (Profile) → Phase 7 (Polish)
2. Each phase builds on the previous
3. Validate at each checkpoint before proceeding

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in same phase
- [Story] label maps task to specific user story for traceability
- All API routes implement permission checks per contracts/api.md
- Reference screenshots in reference/ directory for UI matching
- Seed data provides immediate testability after Phase 1
- Password is REQUIRED when editing accounts (not optional)
- Username must be globally unique (not per-organization)
