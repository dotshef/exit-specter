# Implementation Plan: 공지사항 기능

**Branch**: `004-notice-feature` | **Date**: 2026-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-notice-feature/spec.md`

## Summary

MASTER/AGENCY 사용자를 위한 공지사항 기능을 구현한다. MASTER는 공지사항의 등록/수정/삭제/조회가 가능하고, AGENCY는 조회만 가능하며, ADVERTISER는 접근 자체가 차단된다. Supabase(PostgreSQL)의 notice 테이블을 활용하며, 기존 프로젝트의 UI/API 패턴을 따른다.

## Technical Context

**Language/Version**: TypeScript 5.x + Next.js 16.1.4
**Primary Dependencies**: React 19, Tailwind CSS v4, Prisma ORM, next/navigation
**Storage**: PostgreSQL (Supabase) - notice 테이블 사용
**Testing**: Jest/React Testing Library (기존 설정 유지)
**Target Platform**: 데스크톱 웹 브라우저 (Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: 목록 로드 3초 이내, 상세 페이지 로드 1초 이내
**Constraints**: 기존 UI 스타일 및 API 패턴 준수, Prisma ORM 사용
**Scale/Scope**: 2개 페이지 (목록, 상세) + 2개 모달 (등록, 수정) + 4개 API 엔드포인트

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: PASS (프로젝트 constitution이 플레이스홀더 상태이므로 특별한 제약 없음)

- 기존 코드베이스 패턴 준수 (Prisma ORM, Next.js API Routes)
- 기존 인증/세션 로직 활용
- 기존 UI 컴포넌트 재사용 (Button, Pagination)

## Project Structure

### Documentation (this feature)

```text
specs/004-notice-feature/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (protected)/
│   │   └── notices/
│   │       ├── page.tsx           # 공지사항 목록 페이지
│   │       └── [id]/
│   │           └── page.tsx       # 공지사항 상세 페이지
│   └── api/
│       └── notices/
│           ├── route.ts           # GET(목록), POST(등록)
│           └── [id]/
│               └── route.ts       # GET(상세), PATCH(수정), DELETE(삭제)
├── components/
│   └── notices/
│       ├── NoticeTable.tsx        # 공지사항 목록 테이블
│       ├── NoticeCreateModal.tsx  # 등록 모달
│       └── NoticeEditModal.tsx    # 수정 모달
├── lib/
│   └── permissions.ts             # getSidebarItems 함수 수정
└── types/
    └── index.ts                   # Notice 타입 추가

prisma/
└── schema.prisma                  # Notice 모델 추가
```

**Structure Decision**: 기존 Next.js App Router 구조 유지. accounts 페이지 패턴을 참고하여 notices 페이지 및 API 구현.

## Complexity Tracking

> 특별한 Constitution 위반 없음 - 표 생략

## Implementation Approach

### Phase 1: Prisma 스키마 및 타입 정의

1. prisma/schema.prisma에 Notice 모델 추가
2. src/types/index.ts에 Notice 타입 추가
3. prisma generate 실행

### Phase 2: 권한 및 사이드바 메뉴 수정

1. src/lib/permissions.ts - getSidebarItems 함수 수정
   - MASTER/AGENCY: 공지사항 메뉴 최상단 추가
   - ADVERTISER: 메뉴 표시 안 함
2. canManageNotices, canViewNotices 함수 추가

### Phase 3: API 엔드포인트 구현

1. GET /api/notices - 목록 조회 (MASTER/AGENCY만)
2. POST /api/notices - 등록 (MASTER만)
3. GET /api/notices/[id] - 상세 조회 + 조회수 증가
4. PATCH /api/notices/[id] - 수정 (MASTER만)
5. DELETE /api/notices/[id] - 삭제 (MASTER만)

### Phase 4: 페이지 및 컴포넌트 구현

1. 공지사항 목록 페이지 - NoticeTable, Pagination
2. 공지사항 상세 페이지 - "목록으로" 버튼, 제목/작성일/조회수/본문
3. NoticeCreateModal - 제목/본문 입력
4. NoticeEditModal - 기존 내용 편집
