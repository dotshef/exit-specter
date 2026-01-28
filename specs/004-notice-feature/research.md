# Research: 공지사항 기능

**Feature**: 004-notice-feature
**Date**: 2026-01-27

## 1. 기존 구현 분석

### 1.1 Prisma 스키마 패턴

**파일**: `prisma/schema.prisma`

**현재 모델 패턴**:
- `@id @default(autoincrement())` - 자동 증가 ID
- `@default(now())` - 생성 시간 자동 설정
- `@updatedAt` - 수정 시간 자동 갱신

**Notice 모델 설계**:
```prisma
model Notice {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  viewCount Int      @default(0)
  createdAt DateTime @default(now())
}
```

### 1.2 API 라우트 패턴

**파일**: `src/app/api/accounts/route.ts`

**패턴**:
- `getSession()` 호출로 인증 확인
- 권한 검사 (`role === 'ADVERTISER'` → 403)
- `prisma` 클라이언트로 DB 작업
- `NextResponse.json()` 응답 반환

### 1.3 페이지 컴포넌트 패턴

**파일**: `src/app/(protected)/accounts/page.tsx`

**패턴**:
- `'use client'` 클라이언트 컴포넌트
- `useState`, `useEffect`, `useCallback` 훅 사용
- `/api/me` 호출로 현재 사용자 정보 확인
- 데이터 페칭 후 상태 업데이트
- 모달 컴포넌트로 등록/수정 UI

### 1.4 사이드바 메뉴 구조

**파일**: `src/lib/permissions.ts`

**현재 getSidebarItems 함수**:
```typescript
export function getSidebarItems(role: Role): { label: string; href: string; icon: string }[] {
  const items = [];
  if (role === 'MASTER' || role === 'AGENCY') {
    items.push({ label: '계정관리', href: '/accounts', icon: 'accounts' });
  }
  items.push({ label: '광고관리', href: '/ads', icon: 'ads' });
  return items;
}
```

**변경 방향**:
- MASTER/AGENCY: 공지사항 메뉴를 최상단에 추가
- ADVERTISER: 공지사항 메뉴 없음

## 2. 디자인 결정사항

### Decision 1: Prisma 모델 필드명

**결정**: camelCase 사용 (viewCount, createdAt)
**근거**: 기존 프로젝트의 Prisma 스키마 패턴과 일관성 유지
**대안 검토**:
- snake_case (view_count) - 거부: 기존 패턴과 불일치

### Decision 2: API 엔드포인트 구조

**결정**: RESTful 패턴 사용
- `GET /api/notices` - 목록 조회
- `POST /api/notices` - 등록
- `GET /api/notices/[id]` - 상세 조회
- `PATCH /api/notices/[id]` - 수정
- `DELETE /api/notices/[id]` - 삭제

**근거**: 기존 accounts, ads API 구조와 일관성
**대안 검토**:
- PUT 사용 - 거부: 부분 수정에는 PATCH가 더 적절

### Decision 3: 조회수 증가 시점

**결정**: GET /api/notices/[id] 호출 시 서버에서 증가
**근거**: 클라이언트 조작 방지, 단일 요청으로 처리
**대안 검토**:
- 별도 API 호출 - 거부: 불필요한 네트워크 요청

### Decision 4: 페이지네이션 방식

**결정**: 기존 Pagination 컴포넌트 활용 (클라이언트 사이드)
**근거**: 기존 accounts 페이지와 동일한 UX 제공
**대안 검토**:
- 서버 사이드 페이지네이션 - 거부: 현재 데이터 규모에서 불필요

### Decision 5: 등록/수정 UI

**결정**: 모달 방식 (AccountCreateModal, AccountEditModal 패턴)
**근거**: 기존 패턴과 일관성, 컨텍스트 유지
**대안 검토**:
- 별도 페이지 - 거부: 기존 패턴과 불일치

### Decision 6: 공지사항 메뉴 위치

**결정**: 사이드바 메뉴 최상단 (계정관리 위)
**근거**: reference/task.md 요구사항 ("LNB 메뉴의 제일 위에 위치")
**대안 검토**:
- 계정관리 아래 - 거부: 요구사항 위배

## 3. 기술 구현 접근

### 3.1 Sidebar 아이콘 추가

공지사항 아이콘은 기존 MenuIcon 컴포넌트에 'notices' 타입 추가:
```typescript
if (type === 'notices') {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}
```

### 3.2 권한 검사 함수

```typescript
export function canViewNotices(role: Role): boolean {
  return role === 'MASTER' || role === 'AGENCY';
}

export function canManageNotices(role: Role): boolean {
  return role === 'MASTER';
}
```

### 3.3 날짜 포맷팅

요구사항: YYYY-MM-DD 형식
```typescript
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}
```

## 4. 위험 요소 및 완화

| 위험 | 영향 | 완화 방안 |
|------|------|-----------|
| Supabase 테이블 스키마 불일치 | 높음 | 테이블 구조 확인 후 Prisma 모델 조정 |
| 조회수 동시성 문제 | 낮음 | Prisma의 increment 연산 사용 |
| ADVERTISER 직접 URL 접근 | 중간 | API 레벨 권한 검사 + 페이지 리다이렉트 |

## 5. Supabase 테이블 매핑

**요구사항 (reference/task.md)**:
- 테이블명: notice
- 제목: text
- 내용: text
- 작성날짜: timestamp
- 조회수: int4

**Prisma 모델 매핑**:
```prisma
model Notice {
  id        Int      @id @default(autoincrement())
  title     String   @db.Text
  content   String   @db.Text
  viewCount Int      @default(0) @map("view_count")
  createdAt DateTime @default(now()) @map("created_at")

  @@map("notice")
}
```

**참고**: `@map`을 사용하여 Prisma의 camelCase 필드명을 DB의 snake_case 컬럼명으로 매핑

## 6. 결론

모든 기술적 결정이 완료되었습니다. 기존 프로젝트 패턴을 따르며, Supabase의 notice 테이블과 Prisma ORM을 통해 연동합니다. Phase 1 설계(data-model.md, contracts/)로 진행 가능합니다.
