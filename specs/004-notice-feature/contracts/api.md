# API Contract: 공지사항 기능

**Feature**: 004-notice-feature
**Date**: 2026-01-27

## Base URL

```
/api/notices
```

## Endpoints

### 1. GET /api/notices - 목록 조회

**Description**: 공지사항 목록을 조회한다.

**Authorization**: MASTER, AGENCY (ADVERTISER 403 Forbidden)

**Request**:
```http
GET /api/notices
```

**Response (200 OK)**:
```json
{
  "notices": [
    {
      "id": 1,
      "title": "서비스 점검 안내",
      "viewCount": 42,
      "createdAt": "2026-01-27T10:00:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized` - 인증되지 않은 요청
- `403 Forbidden` - ADVERTISER 권한으로 접근 시

---

### 2. POST /api/notices - 등록

**Description**: 새 공지사항을 등록한다.

**Authorization**: MASTER only (AGENCY, ADVERTISER 403 Forbidden)

**Request**:
```http
POST /api/notices
Content-Type: application/json

{
  "title": "서비스 점검 안내",
  "content": "2026년 1월 30일 02:00~04:00 서비스 점검이 예정되어 있습니다."
}
```

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | 공지사항 제목 (빈 문자열 불가) |
| content | string | Yes | 공지사항 본문 (빈 문자열 불가) |

**Response (201 Created)**:
```json
{
  "id": 1,
  "title": "서비스 점검 안내",
  "content": "2026년 1월 30일 02:00~04:00 서비스 점검이 예정되어 있습니다.",
  "viewCount": 0,
  "createdAt": "2026-01-27T10:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request` - 필수 필드 누락 또는 빈 문자열
- `401 Unauthorized` - 인증되지 않은 요청
- `403 Forbidden` - MASTER 외 권한으로 접근 시

---

### 3. GET /api/notices/[id] - 상세 조회

**Description**: 특정 공지사항의 상세 정보를 조회하고 조회수를 1 증가시킨다.

**Authorization**: MASTER, AGENCY (ADVERTISER 403 Forbidden)

**Request**:
```http
GET /api/notices/1
```

**Response (200 OK)**:
```json
{
  "id": 1,
  "title": "서비스 점검 안내",
  "content": "2026년 1월 30일 02:00~04:00 서비스 점검이 예정되어 있습니다.",
  "viewCount": 43,
  "createdAt": "2026-01-27T10:00:00.000Z"
}
```

**Side Effect**: 조회수(viewCount)가 1 증가한다.

**Error Responses**:
- `401 Unauthorized` - 인증되지 않은 요청
- `403 Forbidden` - ADVERTISER 권한으로 접근 시
- `404 Not Found` - 존재하지 않는 공지사항

---

### 4. PATCH /api/notices/[id] - 수정

**Description**: 기존 공지사항의 제목 및/또는 본문을 수정한다.

**Authorization**: MASTER only (AGENCY, ADVERTISER 403 Forbidden)

**Request**:
```http
PATCH /api/notices/1
Content-Type: application/json

{
  "title": "서비스 점검 안내 (수정)",
  "content": "점검 시간이 변경되었습니다."
}
```

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | No | 수정할 제목 (제공 시 빈 문자열 불가) |
| content | string | No | 수정할 본문 (제공 시 빈 문자열 불가) |

**Response (200 OK)**:
```json
{
  "id": 1,
  "title": "서비스 점검 안내 (수정)",
  "content": "점검 시간이 변경되었습니다.",
  "viewCount": 43,
  "createdAt": "2026-01-27T10:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request` - 빈 문자열 제공
- `401 Unauthorized` - 인증되지 않은 요청
- `403 Forbidden` - MASTER 외 권한으로 접근 시
- `404 Not Found` - 존재하지 않는 공지사항

---

### 5. DELETE /api/notices/[id] - 삭제

**Description**: 공지사항을 삭제한다.

**Authorization**: MASTER only (AGENCY, ADVERTISER 403 Forbidden)

**Request**:
```http
DELETE /api/notices/1
```

**Response (200 OK)**:
```json
{
  "message": "공지사항이 삭제되었습니다."
}
```

**Error Responses**:
- `401 Unauthorized` - 인증되지 않은 요청
- `403 Forbidden` - MASTER 외 권한으로 접근 시
- `404 Not Found` - 존재하지 않는 공지사항

---

## Common Error Response Format

```json
{
  "error": "에러 메시지"
}
```

## Authorization Matrix

| Endpoint | MASTER | AGENCY | ADVERTISER |
|----------|--------|--------|------------|
| GET /api/notices | ✅ | ✅ | ❌ 403 |
| POST /api/notices | ✅ | ❌ 403 | ❌ 403 |
| GET /api/notices/[id] | ✅ | ✅ | ❌ 403 |
| PATCH /api/notices/[id] | ✅ | ❌ 403 | ❌ 403 |
| DELETE /api/notices/[id] | ✅ | ❌ 403 | ❌ 403 |
