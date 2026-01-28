# Data Model: 공지사항 기능

**Feature**: 004-notice-feature
**Date**: 2026-01-27

## Entity: Notice (공지사항)

### Prisma Schema

```prisma
model Notice {
  id        Int      @id @default(autoincrement())
  title     String   @db.Text
  content   String   @db.Text
  viewCount Int      @default(0) @map("view_count")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @map("updated_at")

  @@map("notice")
}
```

### Field Descriptions

| Field     | Type | Description | Constraints |
|-----------|------|-------------|-------------|
| id        | Int | 고유 식별자 | 자동 증가, Primary Key |
| title     | String | 공지사항 제목 | 필수, Text 타입 |
| content   | String | 공지사항 본문 내용 | 필수, Text 타입 |
| viewCount | Int | 조회수 | 기본값 0, 음수 불가 |
| createdAt | DateTime | 작성 날짜/시간 | 자동 설정 (현재 시간) |
| updatedAt | DateTime | 작성 날짜/시간 | 자동 설정 (현재 시간) |

### TypeScript Type

```typescript
// src/types/index.ts에 추가
export interface Notice {
  id: number;
  title: string;
  content: string;
  viewCount: number;
  createdAt: string; // ISO 8601 format
    updatedAt: string; // ISO 8601 format
}
```

### Database Table Mapping

| Prisma Field | DB Column  | DB Type |
|--------------|------------|---------|
| id | id         | int4 (serial) |
| title | title      | text |
| content | content    | text |
| viewCount | view_count | int4 |
| createdAt | created_at | timestamp |
| updatedAt | updated_at | timestamp |

**Table Name**: `notice` (Supabase에 이미 생성됨)

## Validation Rules

### 등록 시 (POST)

| Field | Rule |
|-------|------|
| title | 필수, 빈 문자열 불가 |
| content | 필수, 빈 문자열 불가 |
| viewCount | 자동 0으로 설정 |
| createdAt | 자동 현재 시간 설정 |
| updatedAt | 자동 현재 시간 설정 |

### 수정 시 (PATCH)

| Field | Rule |
|-------|------|
| title | 선택적, 제공 시 빈 문자열 불가 |
| content | 선택적, 제공 시 빈 문자열 불가 |
| viewCount | 수정 불가 (API에서 제외) |
| createdAt | 수정 불가 |
| updatedAt | 자동 현재 시간 설정 |

## State Transitions

### viewCount 증가

```text
[상세 페이지 요청]
    ↓
GET /api/notices/[id]
    ↓
viewCount + 1 (atomic increment)
    ↓
[증가된 조회수와 함께 응답]
```

## Relationships

현재 Notice 엔티티는 다른 엔티티와 관계가 없습니다.

향후 확장 가능성:
- 작성자(User) 관계 추가 가능
- 카테고리 분류 추가 가능

## Sample Data

```json
{
  "id": 1,
  "title": "서비스 점검 안내",
  "content": "2026년 1월 30일 02:00~04:00 서비스 점검이 예정되어 있습니다.",
  "viewCount": 42,
  "createdAt": "2026-01-27T10:00:00.000Z",
  "updatedAt": "2026-01-27T10:00:00.000Z"
}
```

## Display Format

### 날짜 표시 형식

- 목록/상세 페이지: `YYYY-MM-DD` (예: 2026-01-27)
- 변환 함수: `new Date(createdAt).toISOString().split('T')[0]`
