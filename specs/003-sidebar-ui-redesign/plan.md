# Implementation Plan: 좌측 메뉴 UI 재설계

**Branch**: `003-sidebar-ui-redesign` | **Date**: 2026-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-sidebar-ui-redesign/spec.md`

## Summary

기존 헤더 중심의 레이아웃을 제거하고, reference 이미지(ArkPlus 스타일)를 참고하여 흰색 배경의 좌측 사이드바 중심 레이아웃으로 전환한다. 사이드바에는 로고, 메뉴(계정관리, 광고관리), 프로필, 로그아웃이 포함되며, 선택된 메뉴는 primary color(#2E7D5A)와 rounded 스타일로 강조 표시된다.

## Technical Context

**Language/Version**: TypeScript 5.x + Next.js 16.1.4
**Primary Dependencies**: React 19, Tailwind CSS v4, next/image, next/navigation
**Storage**: N/A (UI 전용 변경)
**Testing**: Jest/React Testing Library (기존 설정 유지)
**Target Platform**: 데스크톱 웹 브라우저 (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: 사이드바 렌더링 3초 이내, 부드러운 hover 전환
**Constraints**: primary color #2E7D5A 유지, 기존 인증 로직 변경 없음
**Scale/Scope**: 3개 컴포넌트 수정 (Sidebar, Header 제거, Layout 조정)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: PASS (프로젝트 constitution이 플레이스홀더 상태이므로 특별한 제약 없음)

- 기존 코드베이스 패턴 준수 (Tailwind CSS, React 컴포넌트 구조)
- 기존 인증/세션 로직 변경 없음
- 단순 UI 리팩토링으로 아키텍처 변경 없음

## Project Structure

### Documentation (this feature)

```text
specs/003-sidebar-ui-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (N/A - UI only)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API changes)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css              # CSS 변수 업데이트
│   └── (protected)/
│       └── layout.tsx           # 레이아웃 변경 (Header 제거, Sidebar 확장)
├── components/
│   └── layout/
│       ├── Sidebar.tsx          # 주요 변경: 새로운 디자인 적용
│       └── Header.tsx           # 제거 또는 미사용 처리
└── lib/
    └── permissions.ts           # 기존 유지 (getSidebarItems 함수)

public/
└── K-168.png                    # 로고 이미지 (기존 존재)
```

**Structure Decision**: 기존 Next.js App Router 구조 유지. Sidebar.tsx를 주요 변경 대상으로 하고, Header.tsx는 더 이상 렌더링하지 않도록 layout.tsx에서 제거.

## Complexity Tracking

> 특별한 Constitution 위반 없음 - 표 생략

## Implementation Approach

### Phase 1: Sidebar 컴포넌트 재설계

1. **배경색 변경**: 어두운 녹색(#1F5D3B) → 흰색(#FFFFFF)
2. **로고 이동**: 사이드바 최상단에 K-168.png 배치, 클릭 시 대시보드 이동
3. **메뉴 스타일 변경**:
   - 선택된 메뉴: primary color(#2E7D5A) 배경 + 흰색 텍스트 + rounded-lg
   - 비선택 메뉴: 투명 배경 + 회색 텍스트
   - 호버 상태: gray-100 배경
4. **프로필 영역**: 사이드바 하단에 username 표시, 클릭 시 /profile 이동
5. **로그아웃 버튼**: 프로필 아래 배치

### Phase 2: Layout 변경

1. Header 컴포넌트 렌더링 제거
2. main 영역 margin-top 제거 (헤더 높이만큼 불필요)
3. Sidebar에 username, role props 추가

### Phase 3: CSS 변수 정리

1. --sidebar-bg 값 변경 또는 새 변수 추가
2. 사이드바 너비 조정 (180px → 240px)
