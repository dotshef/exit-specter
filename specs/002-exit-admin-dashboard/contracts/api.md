# API Contracts: EXIT Admin Dashboard MVP

**Date**: 2026-01-23
**Feature**: 002-exit-admin-dashboard

## Overview

All API endpoints are Next.js Route Handlers under `/app/api/`.
Authentication is via HTTP-only cookie containing a JWT token.
All protected endpoints return 401 if no valid session, 403 if insufficient permissions.

---

## Authentication

### POST /api/auth/login

사용자 로그인. 세션 쿠키를 설정한다.

**Request**:
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response 200**:
```json
{
  "user": {
    "id": 1,
    "username": "specter",
    "role": "MASTER",
    "organizationId": null,
    "organizationName": null
  },
  "redirectTo": "/accounts"
}
```

**Response 401**:
```json
{
  "error": "아이디 또는 비밀번호가 올바르지 않습니다."
}
```

**Side Effects**: Sets HTTP-only cookie `session` with JWT token

**Redirect Logic**:
- MASTER → `/accounts`
- AGENCY, ADVERTISER → `/ads`

---

### POST /api/auth/logout

로그아웃. 세션 쿠키를 삭제한다.

**Request**: Empty body

**Response 200**:
```json
{
  "success": true
}
```

**Side Effects**: Clears `session` cookie

---

### GET /api/me

현재 로그인된 사용자 정보를 반환한다.

**Headers**: Cookie: session=<JWT>

**Response 200**:
```json
{
  "user": {
    "id": 1,
    "username": "specter",
    "role": "MASTER",
    "organizationId": null,
    "organizationName": null,
    "memo": "총판 관리자"
  }
}
```

**Response 401**:
```json
{
  "error": "인증이 필요합니다."
}
```

---

## Accounts

### GET /api/accounts

계정 목록 조회. 권한에 따라 반환 범위가 다르다.

**Headers**: Cookie: session=<JWT>

**Query Parameters**:
- `role` (optional): "MASTER" | "AGENCY" | "ADVERTISER" - 역할 필터

**Permission Rules**:
- MASTER: 모든 유저 조회
- AGENCY: 본인 organization 내 ADVERTISER만 조회
- ADVERTISER: 403 (접근 불가)

**Response 200**:
```json
{
  "accounts": [
    {
      "id": 1,
      "username": "specter",
      "role": "MASTER",
      "organizationId": null,
      "organizationName": null,
      "memo": "총판 관리자",
      "createdAt": "2026-01-23T00:00:00.000Z",
      "adCount": 0
    }
  ],
  "stats": {
    "total": 3,
    "master": 1,
    "agency": 1,
    "advertiser": 1
  }
}
```

**Response 403**:
```json
{
  "error": "접근 권한이 없습니다."
}
```

---

### POST /api/accounts

새 계정 등록.

**Headers**: Cookie: session=<JWT>

**Request**:
```json
{
  "username": "string (required)",
  "password": "string (required)",
  "role": "AGENCY | ADVERTISER (required)",
  "organizationId": "number (required for AGENCY/ADVERTISER)",
  "organizationName": "string (optional, new org name if creating)",
  "memo": "string (optional)"
}
```

**Permission Rules**:
- MASTER: AGENCY 등록 가능 (organizationId 또는 새 organizationName 지정)
- AGENCY: ADVERTISER만 등록 가능 (본인 organizationId 자동 할당)
- ADVERTISER: 403

**Response 201**:
```json
{
  "account": {
    "id": 4,
    "username": "newuser",
    "role": "AGENCY",
    "organizationId": 2,
    "organizationName": "새조직",
    "memo": null,
    "createdAt": "2026-01-23T10:00:00.000Z"
  }
}
```

**Response 400**:
```json
{
  "error": "이미 존재하는 아이디입니다."
}
```

**Response 403**:
```json
{
  "error": "계정 등록 권한이 없습니다."
}
```

---

### PATCH /api/accounts/:id

계정 수정.

**Headers**: Cookie: session=<JWT>

**Request**:
```json
{
  "password": "string (required)",
  "memo": "string (optional)"
}
```

**Permission Rules**:
- MASTER: 모든 유저 수정 가능
- AGENCY: 본인 organization 내 ADVERTISER만 수정 가능
- ADVERTISER: 자기 자신만 수정 가능 (/profile에서)

**Response 200**:
```json
{
  "account": {
    "id": 2,
    "username": "alpha",
    "role": "AGENCY",
    "organizationId": 1,
    "memo": "updated memo",
    "createdAt": "2026-01-23T00:00:00.000Z"
  }
}
```

**Response 403**:
```json
{
  "error": "수정 권한이 없습니다."
}
```

**Response 404**:
```json
{
  "error": "계정을 찾을 수 없습니다."
}
```

---

### DELETE /api/accounts

계정 일괄 삭제.

**Headers**: Cookie: session=<JWT>

**Request**:
```json
{
  "ids": [2, 3]
}
```

**Permission Rules**:
- MASTER: 모든 유저 삭제 가능 (자기 자신 제외)
- AGENCY: 본인 organization 내 ADVERTISER만 삭제 가능
- ADVERTISER: 403

**Response 200**:
```json
{
  "deletedCount": 2
}
```

**Response 403**:
```json
{
  "error": "삭제 권한이 없습니다."
}
```

---

## Ads

### GET /api/ads

광고 목록 조회. 권한에 따라 반환 범위가 다르다.

**Headers**: Cookie: session=<JWT>

**Query Parameters**:
- `status` (optional): "WAITING" | "ACTIVE" | "ERROR" | "ENDING_SOON" | "ENDED"
- `kind` (optional): "PAID" | "TEST"

**Permission Rules**:
- MASTER: 모든 광고 조회
- AGENCY: 본인 organization 광고만 조회
- ADVERTISER: 본인 organization 광고만 조회

**Response 200**:
```json
{
  "ads": [
    {
      "id": 1,
      "organizationId": 1,
      "advertiserId": 3,
      "advertiserUsername": "yellow",
      "kind": "PAID",
      "status": "ACTIVE",
      "keyword": "키워드A",
      "rank": 1,
      "productName": "상품A",
      "productId": "P001",
      "quantity": 100,
      "workingDays": 30,
      "startDate": "2026-01-01",
      "endDate": "2026-01-31",
      "createdAt": "2026-01-23T00:00:00.000Z",
      "updatedAt": "2026-01-23T00:00:00.000Z"
    }
  ],
  "stats": {
    "all": {
      "total": 7,
      "active": 2,
      "error": 1,
      "waiting": 2,
      "endingSoon": 1,
      "ended": 1
    },
    "paid": {
      "total": 4,
      "active": 2,
      "error": 1,
      "waiting": 0,
      "endingSoon": 0,
      "ended": 1
    },
    "test": {
      "total": 3,
      "active": 0,
      "error": 0,
      "waiting": 2,
      "endingSoon": 1,
      "ended": 0
    }
  }
}
```

---

### POST /api/ads

새 광고 등록.

**Headers**: Cookie: session=<JWT>

**Request**:
```json
{
  "advertiserId": "number (required)",
  "kind": "PAID | TEST (required)",
  "keyword": "string (optional)",
  "productName": "string (optional)",
  "productId": "string (optional)",
  "quantity": "number (required)",
  "workingDays": "number (required)",
  "startDate": "string ISO date (required)"
}
```

**Permission Rules**:
- MASTER: 모든 광고주에 대해 등록 가능
- AGENCY: 본인 organization 내 광고주에 대해서만 등록 가능
- ADVERTISER: 403

**Computed Fields**:
- `endDate` = `startDate` + `workingDays` days
- `status` = "WAITING" (기본값)
- `organizationId` = advertiser의 organizationId

**Response 201**:
```json
{
  "ad": {
    "id": 8,
    "organizationId": 1,
    "advertiserId": 3,
    "kind": "PAID",
    "status": "WAITING",
    "keyword": "새키워드",
    "rank": null,
    "productName": "새상품",
    "productId": "P008",
    "quantity": 50,
    "workingDays": 14,
    "startDate": "2026-02-01",
    "endDate": "2026-02-15",
    "createdAt": "2026-01-23T10:00:00.000Z",
    "updatedAt": "2026-01-23T10:00:00.000Z"
  }
}
```

**Response 403**:
```json
{
  "error": "광고 등록 권한이 없습니다."
}
```

---

### PATCH /api/ads/:id

광고 수정.

**Headers**: Cookie: session=<JWT>

**Request**:
```json
{
  "status": "ACTIVE | ERROR | ENDING_SOON | ENDED (optional)",
  "keyword": "string (optional)",
  "rank": "number (optional)",
  "productName": "string (optional)",
  "productId": "string (optional)",
  "quantity": "number (optional)",
  "workingDays": "number (optional)",
  "startDate": "string ISO date (optional)"
}
```

**Permission Rules**:
- MASTER: 모든 광고 수정 가능
- AGENCY: 본인 organization 광고만 수정 가능
- ADVERTISER: 403

**Computed Fields** (if startDate or workingDays changed):
- `endDate` = `startDate` + `workingDays` days

**Response 200**:
```json
{
  "ad": { ... }
}
```

---

### DELETE /api/ads

광고 일괄 삭제.

**Headers**: Cookie: session=<JWT>

**Request**:
```json
{
  "ids": [1, 2, 3]
}
```

**Permission Rules**:
- MASTER: 모든 광고 삭제 가능
- AGENCY: 본인 organization 광고만 삭제 가능
- ADVERTISER: 403

**Response 200**:
```json
{
  "deletedCount": 3
}
```

---

## Organizations

### GET /api/organizations

조직 목록 조회 (MASTER 전용, 계정 등록 시 organization 선택용).

**Headers**: Cookie: session=<JWT>

**Permission Rules**:
- MASTER: 접근 가능
- AGENCY/ADVERTISER: 403

**Response 200**:
```json
{
  "organizations": [
    {
      "id": 1,
      "name": "알파",
      "userCount": 2
    }
  ]
}
```

---

## Common Error Responses

| Status | Body | Description |
|--------|------|-------------|
| 401 | `{"error": "인증이 필요합니다."}` | 세션 없음/만료 |
| 403 | `{"error": "접근 권한이 없습니다."}` | 권한 부족 |
| 404 | `{"error": "리소스를 찾을 수 없습니다."}` | 존재하지 않는 리소스 |
| 400 | `{"error": "<specific message>"}` | 유효성 검증 실패 |
| 500 | `{"error": "서버 오류가 발생했습니다."}` | 서버 내부 오류 |
