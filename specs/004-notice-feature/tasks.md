# Tasks: 공지사항 기능

**Input**: Design documents from `/specs/004-notice-feature/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Not requested - test tasks excluded.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prisma 스키마 및 타입 정의

- [X] T001 Add Notice model to prisma/schema.prisma with @map directives for Supabase table mapping
- [X] T002 Add Notice interface to src/types/index.ts
- [X] T003 Run `npx prisma generate` to update Prisma client

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 권한 함수 및 사이드바 메뉴 설정 - 모든 User Story에 필요

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Add canViewNotices(role) function to src/lib/permissions.ts (MASTER/AGENCY → true)
- [X] T005 [P] Add canManageNotices(role) function to src/lib/permissions.ts (MASTER → true)
- [X] T006 Modify getSidebarItems function in src/lib/permissions.ts to add notices menu at top for MASTER/AGENCY
- [X] T007 Add 'notices' icon type to MenuIcon component in src/components/layout/Sidebar.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 공지사항 목록 조회 (Priority: P1) 🎯 MVP

**Goal**: MASTER/AGENCY 사용자가 사이드바에서 공지사항 메뉴를 통해 목록 페이지에 접근하여 제목, 작성일, 조회수가 표시된 공지사항 목록을 확인하고 페이지네이션으로 탐색

**Independent Test**: 로그인 후 사이드바에서 공지사항 메뉴 클릭 → 목록 페이지 표시 → 공지사항 목록(제목, 작성일, 조회수) 확인 → 페이지네이션 동작 확인

### Implementation for User Story 1

- [X] T008 [US1] Create GET handler for notice list in src/app/api/notices/route.ts with MASTER/AGENCY authorization
- [X] T009 [P] [US1] Create NoticeTable component in src/components/notices/NoticeTable.tsx with title, date, viewCount columns
- [X] T010 [US1] Create notices list page in src/app/(protected)/notices/page.tsx with NoticeTable and Pagination
- [X] T011 [US1] Add empty state message "등록된 공지사항이 없습니다" to notices list page
- [X] T012 [US1] Add ADVERTISER redirect/403 handling in notices list page

**Checkpoint**: User Story 1 완료 - 목록 조회 기능이 독립적으로 테스트 가능

---

## Phase 4: User Story 2 - 공지사항 상세 조회 (Priority: P1)

**Goal**: MASTER/AGENCY 사용자가 목록에서 공지사항을 선택하여 상세 페이지에서 제목, 작성일, 조회수, 본문을 확인하고 "목록으로" 버튼으로 복귀

**Independent Test**: 목록 페이지에서 공지사항 클릭 → 상세 페이지 표시 → 제목/작성일/조회수/본문 확인 → "목록으로" 버튼 클릭 → 목록 페이지 복귀

### Implementation for User Story 2

- [X] T013 [US2] Create GET handler for notice detail in src/app/api/notices/[id]/route.ts with viewCount increment
- [X] T014 [US2] Add 404 handling for non-existent notice in src/app/api/notices/[id]/route.ts
- [X] T015 [US2] Create notice detail page in src/app/(protected)/notices/[id]/page.tsx with "목록으로" button
- [X] T016 [US2] Display title, createdAt (YYYY-MM-DD), viewCount, content in detail page
- [X] T017 [US2] Add click handler to NoticeTable rows to navigate to detail page in src/components/notices/NoticeTable.tsx
- [X] T018 [US2] Add ADVERTISER redirect/403 handling in notice detail page

**Checkpoint**: User Story 2 완료 - 상세 조회 기능이 독립적으로 테스트 가능

---

## Phase 5: User Story 3 - 공지사항 등록 (Priority: P2)

**Goal**: MASTER 사용자가 새 공지사항을 등록 (제목/본문 입력, 작성일 자동 설정, 조회수 0 초기화)

**Independent Test**: MASTER로 로그인 → 등록 버튼 클릭 → 제목/본문 입력 → 저장 → 목록에 새 공지사항 표시 확인

### Implementation for User Story 3

- [X] T019 [US3] Create POST handler for notice creation in src/app/api/notices/route.ts with MASTER-only authorization
- [X] T020 [US3] Add validation for required title and content (non-empty) in POST handler
- [X] T021 [US3] Create NoticeCreateModal component in src/components/notices/NoticeCreateModal.tsx with title/content fields
- [X] T022 [US3] Add form validation to NoticeCreateModal (required fields, empty string check)
- [X] T023 [US3] Add "등록" button to notices list page (visible only for MASTER) in src/app/(protected)/notices/page.tsx
- [X] T024 [US3] Connect NoticeCreateModal to list page with open/close state and data refresh

**Checkpoint**: User Story 3 완료 - 등록 기능이 독립적으로 테스트 가능

---

## Phase 6: User Story 4 - 공지사항 수정 (Priority: P2)

**Goal**: MASTER 사용자가 기존 공지사항의 제목과 본문을 수정

**Independent Test**: MASTER로 로그인 → 목록에서 공지사항 선택 → 수정 버튼 클릭 → 내용 수정 → 저장 → 변경 내용 확인

### Implementation for User Story 4

- [X] T025 [US4] Create PATCH handler for notice update in src/app/api/notices/[id]/route.ts with MASTER-only authorization
- [X] T026 [US4] Add validation for non-empty title/content when provided in PATCH handler
- [X] T027 [US4] Create NoticeEditModal component in src/components/notices/NoticeEditModal.tsx with pre-filled title/content
- [X] T028 [US4] Add form validation to NoticeEditModal (non-empty when provided)
- [X] T029 [US4] Add "수정" button to notice detail page (visible only for MASTER) in src/app/(protected)/notices/[id]/page.tsx
- [X] T030 [US4] Connect NoticeEditModal to detail page with open/close state and data refresh

**Checkpoint**: User Story 4 완료 - 수정 기능이 독립적으로 테스트 가능

---

## Phase 7: User Story 5 - 공지사항 삭제 (Priority: P3)

**Goal**: MASTER 사용자가 공지사항을 삭제 (확인 메시지 후 삭제)

**Independent Test**: MASTER로 로그인 → 목록에서 공지사항 선택 → 삭제 버튼 클릭 → 확인 → 목록에서 삭제 확인

### Implementation for User Story 5

- [X] T031 [US5] Create DELETE handler for notice deletion in src/app/api/notices/[id]/route.ts with MASTER-only authorization
- [X] T032 [US5] Add "삭제" button to notice detail page (visible only for MASTER) in src/app/(protected)/notices/[id]/page.tsx
- [X] T033 [US5] Add delete confirmation dialog (window.confirm or modal) before deletion
- [X] T034 [US5] Navigate to list page after successful deletion

**Checkpoint**: User Story 5 완료 - 삭제 기능이 독립적으로 테스트 가능

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: 빌드 검증 및 최종 점검

- [X] T035 Run `npm run build` to verify no TypeScript/build errors
- [X] T036 Verify all API endpoints return proper error responses (401, 403, 404)
- [X] T037 Test ADVERTISER cannot access /notices URL directly (redirect or 403)
- [X] T038 Run quickstart.md verification steps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 but US2 depends on US1's table component
  - US3 and US4 are both P2 and can run in parallel after US1/US2
  - US5 (P3) can start after Foundational, but logically after US3/US4
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Depends on US1 (uses NoticeTable component for navigation)
- **User Story 3 (P2)**: Can start after US1 (needs list page for button placement)
- **User Story 4 (P2)**: Can start after US2 (needs detail page for button placement)
- **User Story 5 (P3)**: Can start after US2 (needs detail page for button placement)

### Within Each User Story

- API handlers before UI components
- Components before page integration
- Core implementation before edge cases

### Parallel Opportunities

- T004, T005 can run in parallel (different functions in same file)
- T008, T009 can run in parallel (API vs component)
- After Phase 2, US3/US4/US5 implementation can be parallelized at component level

---

## Parallel Example: Phase 2

```bash
# Launch permission functions in parallel:
Task: "Add canViewNotices(role) function to src/lib/permissions.ts"
Task: "Add canManageNotices(role) function to src/lib/permissions.ts"
```

## Parallel Example: User Story 1

```bash
# Launch API and component in parallel:
Task: "Create GET handler for notice list in src/app/api/notices/route.ts"
Task: "Create NoticeTable component in src/components/notices/NoticeTable.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. Complete Phase 1: Setup (Prisma, types)
2. Complete Phase 2: Foundational (permissions, sidebar)
3. Complete Phase 3: User Story 1 (목록 조회)
4. Complete Phase 4: User Story 2 (상세 조회)
5. **STOP and VALIDATE**: Test US1 + US2 independently
6. Deploy/demo if ready - MASTER/AGENCY can view notices

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → 목록 조회 가능
3. Add User Story 2 → Test independently → 상세 조회 가능 (MVP!)
4. Add User Story 3 → Test independently → MASTER 등록 가능
5. Add User Story 4 → Test independently → MASTER 수정 가능
6. Add User Story 5 → Test independently → MASTER 삭제 가능 (Full Feature)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 → User Story 2
   - Developer B: (waits for US1) → User Story 3
   - Developer C: (waits for US2) → User Story 4 → User Story 5
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Supabase notice table already exists - no migration needed
- Follow existing project patterns (accounts page, ads API)
