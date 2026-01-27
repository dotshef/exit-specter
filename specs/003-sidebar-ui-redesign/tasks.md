# Tasks: 좌측 메뉴 UI 재설계

**Input**: Design documents from `/specs/003-sidebar-ui-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: 테스트가 명시적으로 요청되지 않아 테스트 작업은 제외됨

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (Next.js)**: `src/app/`, `src/components/`, `src/lib/`
- CSS: `src/app/globals.css`
- Layouts: `src/app/(protected)/layout.tsx`
- Components: `src/components/layout/`

---

## Phase 1: Setup (CSS 변수 업데이트)

**Purpose**: 새로운 사이드바 레이아웃을 위한 CSS 기반 준비

- [x] T001 Update sidebar width CSS variable from 180px to 240px in `src/app/globals.css`

---

## Phase 2: Foundational (Sidebar Props 확장)

**Purpose**: Sidebar 컴포넌트가 username을 받을 수 있도록 인터페이스 확장

**⚠️ CRITICAL**: 이 단계가 완료되어야 User Story 작업 진행 가능

- [x] T002 Extend SidebarProps interface to include username in `src/components/layout/Sidebar.tsx`

**Checkpoint**: Sidebar가 username prop을 받을 준비 완료

---

## Phase 3: User Story 1 - 새로운 사이드바 기반 네비게이션 경험 (Priority: P1) MVP

**Goal**: 흰색 배경의 사이드바에서 메뉴 네비게이션이 가능하고, 선택된 메뉴가 primary color로 강조됨

**Independent Test**: 사이드바 메뉴 클릭으로 페이지 이동, 선택된 메뉴 시각적 구분 확인

### Implementation for User Story 1

- [x] T003 [US1] Change Sidebar background from dark green to white with border in `src/components/layout/Sidebar.tsx`
- [x] T004 [US1] Update Sidebar position from top-[56px] to top-0 in `src/components/layout/Sidebar.tsx`
- [x] T005 [US1] Update Sidebar width from w-[180px] to w-[240px] in `src/components/layout/Sidebar.tsx`
- [x] T006 [US1] Update active menu style to primary color background with rounded-lg in `src/components/layout/Sidebar.tsx`
- [x] T007 [US1] Update inactive menu text color to gray-600 in `src/components/layout/Sidebar.tsx`
- [x] T008 [US1] Update hover state to gray-100 background with rounded-lg in `src/components/layout/Sidebar.tsx`
- [x] T009 [US1] Ensure all menu items have equal width and height in `src/components/layout/Sidebar.tsx`

**Checkpoint**: 흰색 배경 사이드바에서 메뉴 네비게이션 및 선택 상태 표시 완료

---

## Phase 4: User Story 2 - 사이드바 상단 로고 표시 (Priority: P1)

**Goal**: 사이드바 최상단에 로고가 표시되고 클릭 시 대시보드로 이동

**Independent Test**: 로고 표시 확인, 클릭 시 대시보드 이동 확인

### Implementation for User Story 2

- [x] T010 [US2] Add logo section at the top of Sidebar using next/image in `src/components/layout/Sidebar.tsx`
- [x] T011 [US2] Wrap logo with Link component to navigate to dashboard on click in `src/components/layout/Sidebar.tsx`
- [x] T012 [US2] Style logo section with appropriate padding and border-bottom in `src/components/layout/Sidebar.tsx`

**Checkpoint**: 사이드바 최상단에 클릭 가능한 로고 표시 완료

---

## Phase 5: User Story 3 - 프로필 및 로그아웃 영역 재배치 (Priority: P2)

**Goal**: 사이드바 하단에 프로필(username)과 로그아웃 버튼 배치

**Independent Test**: username 표시 확인, 프로필 클릭 시 /profile 이동, 로그아웃 클릭 시 세션 종료

### Implementation for User Story 3

- [x] T013 [US3] Add profile section at bottom of Sidebar showing username in `src/components/layout/Sidebar.tsx`
- [x] T014 [US3] Make profile section clickable to navigate to /profile in `src/components/layout/Sidebar.tsx`
- [x] T015 [US3] Add logout button below profile section in `src/components/layout/Sidebar.tsx`
- [x] T016 [US3] Implement handleLogout function (POST to /api/auth/logout, redirect to /login) in `src/components/layout/Sidebar.tsx`
- [x] T017 [US3] Add text truncation (ellipsis) for long usernames in `src/components/layout/Sidebar.tsx`
- [x] T018 [US3] Use flexbox spacer to push profile/logout to bottom of Sidebar in `src/components/layout/Sidebar.tsx`

**Checkpoint**: 프로필 표시 및 로그아웃 기능 완료

---

## Phase 6: User Story 4 - 헤더 제거 및 레이아웃 조정 (Priority: P2)

**Goal**: 상단 헤더 제거, 콘텐츠 영역이 사이드바 우측 전체 활용

**Independent Test**: 헤더 미표시 확인, 콘텐츠 영역 레이아웃 확인

### Implementation for User Story 4

- [x] T019 [US4] Remove Header component import from `src/app/(protected)/layout.tsx`
- [x] T020 [US4] Remove Header component rendering from `src/app/(protected)/layout.tsx`
- [x] T021 [US4] Pass username prop to Sidebar in `src/app/(protected)/layout.tsx`
- [x] T022 [US4] Update main element margin from mt-[56px] to mt-0 in `src/app/(protected)/layout.tsx`
- [x] T023 [US4] Update main element margin-left from ml-[180px] to ml-[240px] in `src/app/(protected)/layout.tsx`

**Checkpoint**: 헤더 없이 사이드바 중심 레이아웃 완료

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 최종 검증 및 정리

- [x] T024 [P] Add MENU label above menu items matching reference design in `src/components/layout/Sidebar.tsx`
- [x] T025 [P] Add appropriate icons for profile and logout menu items in `src/components/layout/Sidebar.tsx`
- [x] T026 Verify visual consistency with reference images (대시보드화면.png, 광고관리화면.png)
- [x] T027 Run quickstart.md validation checklist manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Story 1 (Phase 3)**: Depends on Foundational - CORE UI changes
- **User Story 2 (Phase 4)**: Depends on Foundational - Can run parallel with US1
- **User Story 3 (Phase 5)**: Depends on Foundational - Can run parallel with US1, US2
- **User Story 4 (Phase 6)**: Depends on US1, US2, US3 (all Sidebar changes complete before Layout changes)
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Sidebar 배경, 메뉴 스타일 - 독립적
- **User Story 2 (P1)**: Sidebar 로고 추가 - 독립적
- **User Story 3 (P2)**: Sidebar 프로필/로그아웃 - 독립적
- **User Story 4 (P2)**: Layout 변경 - US1~US3 완료 후 진행 권장 (Sidebar 완성 후 통합)

### Within Each User Story

- T003-T009 (US1): 순차 진행 권장 (동일 파일)
- T010-T012 (US2): 순차 진행 권장 (동일 파일)
- T013-T018 (US3): 순차 진행 권장 (동일 파일)
- T019-T023 (US4): 순차 진행 권장 (동일 파일)

### Parallel Opportunities

- US1, US2, US3는 모두 Sidebar.tsx를 수정하므로 순차 진행이 충돌 방지에 유리
- 그러나 개념적으로는 다른 영역을 다루므로 신중한 병합으로 병렬 가능
- US4는 Layout.tsx만 수정하므로 Sidebar 작업과 병렬 가능 (단, US3 완료 후 props 전달 필요)

---

## Parallel Example: Phase 7 Polish

```bash
# Launch parallel polish tasks:
Task: "Add MENU label above menu items matching reference design in src/components/layout/Sidebar.tsx"
Task: "Add appropriate icons for profile and logout menu items in src/components/layout/Sidebar.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002)
3. Complete Phase 3: User Story 1 (T003-T009)
4. Complete Phase 4: User Story 2 (T010-T012)
5. **STOP and VALIDATE**: 사이드바 기본 UI 완성 확인
6. Deploy/demo if ready

### Full Implementation

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → 메뉴 네비게이션 완료
3. Add User Story 2 → 로고 추가 완료
4. Add User Story 3 → 프로필/로그아웃 완료
5. Add User Story 4 → 헤더 제거 및 레이아웃 통합
6. Add Polish → 최종 검증

### Recommended Order

모든 작업이 동일 파일(Sidebar.tsx, layout.tsx)을 대상으로 하므로 순차 실행 권장:

```
T001 → T002 → T003-T009 → T010-T012 → T013-T018 → T019-T023 → T024-T027
```

---

## Notes

- 모든 Sidebar 관련 작업(US1, US2, US3)은 `src/components/layout/Sidebar.tsx` 파일 수정
- Layout 관련 작업(US4)은 `src/app/(protected)/layout.tsx` 파일 수정
- CSS 변수 작업(Setup)은 `src/app/globals.css` 파일 수정
- primary color #2E7D5A는 기존 CSS 변수 `var(--primary)` 사용
- reference 이미지 참고: `reference/대시보드화면.png`, `reference/광고관리화면.png`
- 각 Checkpoint에서 해당 기능 독립 테스트 가능
- Commit after each phase or logical group

---

## Implementation Summary

**Completed**: 2026-01-27

All 27 tasks have been completed successfully:

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1: Setup | T001 | ✓ Complete |
| Phase 2: Foundational | T002 | ✓ Complete |
| Phase 3: User Story 1 | T003-T009 | ✓ Complete |
| Phase 4: User Story 2 | T010-T012 | ✓ Complete |
| Phase 5: User Story 3 | T013-T018 | ✓ Complete |
| Phase 6: User Story 4 | T019-T023 | ✓ Complete |
| Phase 7: Polish | T024-T027 | ✓ Complete |

**Build Status**: ✓ Successful (Next.js 16.1.4 + Turbopack)
