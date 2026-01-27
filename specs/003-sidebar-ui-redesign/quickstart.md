# Quickstart: 좌측 메뉴 UI 재설계

**Feature**: 003-sidebar-ui-redesign
**Date**: 2026-01-27

## 개요

이 기능은 기존 헤더 + 사이드바 레이아웃을 헤더 없이 사이드바 중심의 레이아웃으로 변경합니다.

## 변경 대상 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `src/components/layout/Sidebar.tsx` | 수정 | 새로운 디자인 적용, props 확장 |
| `src/app/(protected)/layout.tsx` | 수정 | Header 제거, Sidebar props 전달 |
| `src/app/globals.css` | 수정 | CSS 변수 업데이트 |
| `src/components/layout/Header.tsx` | 미사용 | 더 이상 렌더링하지 않음 (삭제 선택) |

## 구현 단계

### 1단계: CSS 변수 업데이트

`src/app/globals.css`에서:
```css
:root {
  --sidebar-width: 240px;  /* 180px → 240px */
  /* 기존 primary color 유지 */
}
```

### 2단계: Sidebar 컴포넌트 수정

주요 변경사항:
1. Props에 `username` 추가
2. 배경색을 흰색으로 변경
3. 로고를 최상단에 배치
4. 선택된 메뉴 스타일 변경 (primary color + rounded)
5. 프로필 영역 하단에 추가
6. 로그아웃 버튼 추가

### 3단계: Layout 수정

`src/app/(protected)/layout.tsx`에서:
1. Header import 및 렌더링 제거
2. Sidebar에 `username={session.username}` 전달
3. main 영역 margin 조정: `mt-[56px]` → `mt-0`

## 테스트 체크리스트

- [ ] 로그인 후 사이드바가 흰색 배경으로 표시됨
- [ ] 상단 헤더가 표시되지 않음
- [ ] 사이드바 최상단에 로고 표시됨
- [ ] 로고 클릭 시 대시보드로 이동
- [ ] 현재 페이지에 해당하는 메뉴가 primary color로 강조됨
- [ ] 메뉴 hover 시 gray 배경 표시
- [ ] 사이드바 하단에 username 표시
- [ ] 프로필 클릭 시 /profile로 이동
- [ ] 로그아웃 버튼 클릭 시 세션 종료 및 로그인 페이지 이동

## 롤백 절차

문제 발생 시:
1. `git checkout develop -- src/components/layout/Sidebar.tsx`
2. `git checkout develop -- src/app/(protected)/layout.tsx`
3. `git checkout develop -- src/app/globals.css`

## 참고 자료

- Reference 이미지: `reference/대시보드화면.png`, `reference/광고관리화면.png`
- 요구사항: `reference/task.md`
- 명세서: `specs/003-sidebar-ui-redesign/spec.md`
