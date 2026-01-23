# Feature Specification: EXIT Admin Dashboard MVP 

**Feature Branch**: `002-exit-admin-dashboard`
**Created**: 2026-01-23
**Status**: Draft
**Input**: User description: "EXIT 내부용 웹 어드민 대시보드 MVP - 계정관리, 광고관리, 프로필 수정 기능을 포함한 Organization 기반 어드민 시스템. MASTER 계정은 organization에 속하지 않으며, AGENCY/ADVERTISER만 organization에 소속된다."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Authentication (Priority: P1)

사용자는 아이디/비밀번호로 로그인하여 대시보드에 진입한다. MASTER 계정은 organization 없이 바로 로그인되며, AGENCY/ADVERTISER는 자신이 속한 organization 컨텍스트로 로그인된다.

**Why this priority**: 로그인 없이는 어떤 기능도 사용할 수 없으므로 가장 핵심적인 기능이다. Organization 기반 데이터 격리의 진입점이다.

**Independent Test**: 시드 데이터로 생성된 MASTER 계정(specter/0000)과 AGENCY 계정(alpha/0000)으로 각각 로그인하여 대시보드에 진입할 수 있다.

**Acceptance Scenarios**:

1. **Given** 유효한 MASTER 계정이 존재할 때, **When** 올바른 아이디/비밀번호를 입력하고 로그인 버튼을 클릭하면, **Then** /accounts 페이지로 이동한다
2. **Given** 유효한 AGENCY 계정이 존재할 때, **When** 올바른 아이디/비밀번호를 입력하고 로그인 버튼을 클릭하면, **Then** /ads 페이지로 이동한다
3. **Given** 유효한 ADVERTISER 계정이 존재할 때, **When** 올바른 아이디/비밀번호를 입력하고 로그인 버튼을 클릭하면, **Then** /ads 페이지로 이동한다
4. **Given** 잘못된 아이디/비밀번호를 입력한 경우, **When** 로그인 버튼을 클릭하면, **Then** 오류 메시지가 표시된다
5. **Given** 로그인된 상태에서, **When** 헤더 드롭다운의 "로그아웃" 버튼을 클릭하면, **Then** 세션이 종료되고 로그인 페이지로 이동한다

---

### User Story 2 - Account Management for MASTER/AGENCY (Priority: P1)

MASTER 또는 AGENCY 권한을 가진 사용자는 계정관리 페이지에서 계정 현황을 조회하고, 권한에 따라 새 계정을 등록하거나 기존 계정을 수정/삭제할 수 있다. MASTER는 모든 유저를 관리하고, AGENCY는 본인 organization 내 ADVERTISER만 관리한다.

**Why this priority**: 계정관리는 어드민 시스템의 핵심 기능이다. 새로운 사용자를 추가하고 관리하는 것은 시스템 운영의 기본이다.

**Independent Test**: MASTER 계정으로 로그인하여 새 AGENCY 계정을 생성하고, 해당 계정으로 로그인할 수 있다.

**Acceptance Scenarios**:

1. **Given** MASTER로 로그인한 경우, **When** 계정관리 페이지에 접근하면, **Then** 모든 유저의 계정 목록과 현황(전체/총판사/대행사/광고주 숫자)이 표시된다
2. **Given** AGENCY로 로그인한 경우, **When** 계정관리 페이지에 접근하면, **Then** 본인 organization 내 ADVERTISER 계정 목록만 표시된다
3. **Given** 계정관리 페이지에서, **When** 등록 버튼을 클릭하면, **Then** 계정 등록 모달이 열린다
4. **Given** MASTER가 계정 등록 모달에서 필수 필드를 입력하고 권한을 AGENCY로 선택한 경우, **When** 등록 버튼을 클릭하면, **Then** 새 AGENCY 계정이 생성되고 테이블이 갱신된다
5. **Given** AGENCY가 계정 등록 모달에서 필수 필드를 입력한 경우, **When** 등록 버튼을 클릭하면, **Then** 새 ADVERTISER 계정이 본인 organization에 소속되어 생성된다 (권한은 자동으로 ADVERTISER로 고정)
6. **Given** 계정 목록에서 톱니바퀴 아이콘을 클릭한 경우, **When** 계정 수정 모달에서 비밀번호/메모를 변경하고 수정 버튼을 클릭하면, **Then** 계정 정보가 업데이트된다
7. **Given** 하나 이상의 계정이 체크박스로 선택된 경우, **When** 삭제 버튼을 클릭하면, **Then** 선택된 계정들이 삭제된다

---

### User Story 3 - Ad Management (Priority: P1)

사용자는 광고관리 페이지에서 광고 현황을 조회하고, 권한에 따라 광고를 등록/수정/삭제할 수 있다. MASTER는 모든 광고를, AGENCY/ADVERTISER는 본인 organization 광고만 접근 가능하다.

**Why this priority**: 광고관리는 이 시스템의 주요 비즈니스 기능이다. 광고 상태별 현황 조회와 필터링이 핵심이다.

**Independent Test**: AGENCY 계정으로 로그인하여 새 광고를 등록하고, 광고 현황 카드에서 "대기" 상태의 숫자가 증가하는 것을 확인할 수 있다.

**Acceptance Scenarios**:

1. **Given** 로그인한 사용자가 광고관리 페이지에 접근하면, **When** 페이지가 로드되면, **Then** 전체현황, 광고현황, 테스트현황 카드와 광고 테이블이 표시된다
2. **Given** 현황 카드의 숫자 지표를 클릭하면, **When** 해당 상태(전체/정상/오류/대기/종료예정/종료)가 선택되면, **Then** 해당 상태의 광고만 테이블에 필터링되어 표시되고 선택된 숫자는 파란색으로 표시된다
3. **Given** 전체현황/광고현황/테스트현황 간에는 하나의 상태만 선택 가능하며, **When** 다른 카드의 상태를 클릭하면, **Then** 기존 선택이 해제되고 새 상태로 필터링된다
4. **Given** MASTER 또는 AGENCY로 로그인한 경우, **When** 등록 버튼을 클릭하면, **Then** 광고 추가 모달이 열린다
5. **Given** 광고 추가 모달에서 필수 필드를 입력한 경우, **When** 추가 버튼을 클릭하면, **Then** 새 광고가 "대기" 상태로 생성된다
6. **Given** 작업 시작일과 일수를 입력한 경우, **When** 값이 변경되면, **Then** 작업 종료일이 자동 계산되어 읽기전용으로 표시된다
7. **Given** ADVERTISER로 로그인한 경우, **When** 광고관리 페이지에 접근하면, **Then** 등록/수정/삭제 버튼이 숨겨지고 조회만 가능하다
8. **Given** 하나 이상의 광고가 선택된 경우, **When** 삭제 버튼을 클릭하면, **Then** 선택된 광고들이 삭제된다

---

### User Story 4 - Profile Management (Priority: P2)

로그인한 사용자는 자신의 프로필(비밀번호, 메모)을 수정할 수 있다. 헤더의 드롭다운에서 "프로필 수정"을 클릭하여 접근한다.

**Why this priority**: 기본적인 사용자 자기관리 기능으로, 필수적이지만 핵심 비즈니스 로직은 아니다.

**Independent Test**: 로그인 후 프로필 수정 페이지에서 비밀번호를 변경하고, 새 비밀번호로 재로그인할 수 있다.

**Acceptance Scenarios**:

1. **Given** 로그인된 상태에서, **When** 헤더의 드롭다운에서 "프로필 수정"을 클릭하면, **Then** 프로필 수정 페이지가 표시되며 현재 사용자의 아이디(읽기전용), 권한(읽기전용), 메모가 표시된다
2. **Given** 프로필 수정 페이지에서 새 비밀번호와 메모를 입력한 경우, **When** 수정 버튼을 클릭하면, **Then** 정보가 업데이트되고 성공 토스트가 표시된다

---

### Edge Cases

- **빈 비밀번호 입력 시**: 계정 수정에서 비밀번호 입력은 필수 값
- **중복 아이디**: 중복 아이디로 계정 등록 시 오류 메시지 표시
- **권한 위반**: API 레벨에서 권한 검증 실패 시 403 에러 반환
- **세션 만료**: 세션 만료 시 로그인 페이지로 리다이렉트
- **자기 자신 삭제 방지**: 현재 로그인한 계정은 삭제 대상에서 제외
- **MASTER의 organization**: MASTER 계정은 organizationId가 null이며, organization 선택 없이 시스템 전체를 관리
- **AGENCY 계정 등록 시**: AGENCY는 자신이 속한 organization으로만 ADVERTISER를 초대할 수 있음. MASTER가 사용자를 등록할 때 해당 사용자가 속할 organization을 지정해야 함

## Requirements *(mandatory)*

### Functional Requirements

**인증 및 세션**
- **FR-001**: 시스템은 아이디/비밀번호 기반의 로그인을 지원해야 한다
- **FR-002**: 시스템은 HTTP-only 쿠키 기반 세션 관리를 구현해야 한다
- **FR-003**: 비밀번호는 bcrypt로 해시 저장해야 한다
- **FR-004**: 로그인 성공 시 권한에 따라 MASTER는 /accounts, AGENCY/ADVERTISER는 /ads로 이동해야 한다

**Organization 모델**
- **FR-005**: MASTER 계정은 organizationId 없이 존재하며 모든 데이터에 접근 가능해야 한다
- **FR-006**: AGENCY/ADVERTISER 계정은 반드시 하나의 organization에 소속되어야 한다
- **FR-007**: 각 사용자 계정은 (username) 으로 고유해야 한다

**계정관리**
- **FR-008**: MASTER는 모든 유저를 조회/등록/수정/삭제할 수 있어야 한다
- **FR-009**: AGENCY는 본인 organization 내 ADVERTISER만 조회/등록/수정/삭제할 수 있어야 한다
- **FR-010**: ADVERTISER는 자기 자신의 프로필(비밀번호/메모)만 수정할 수 있어야 한다
- **FR-011**: 계정 등록 시 MASTER는 AGENCY를, AGENCY는 ADVERTISER만 초대할 수 있어야 한다
- **FR-012**: MASTER가 AGENCY를 등록할 때 해당 AGENCY가 속할 organization을 지정해야 한다
- **FR-013**: 계정 현황 카드는 전체/총판사/대행사/광고주 수를 표시해야 한다

**광고관리**
- **FR-014**: MASTER는 모든 광고를 조회/등록/수정/삭제할 수 있어야 한다
- **FR-015**: AGENCY는 본인 organization의 광고만 등록/수정/삭제할 수 있어야 한다
- **FR-016**: ADVERTISER는 본인 organization의 광고를 조회만 할 수 있어야 한다
- **FR-017**: 광고 현황 카드는 전체현황(전체/정상/오류/대기/종료예정/종료), 광고현황, 테스트현황을 표시해야 한다
- **FR-018**: 현황 카드의 숫자 클릭 시 해당 상태로 테이블을 필터링해야 한다
- **FR-019**: 전체현황/광고현황/테스트현황에서 하나의 상태만 필터 조건으로 선택 가능해야 한다
- **FR-020**: 광고 추가 시 상태는 기본 "대기"로 설정해야 한다
- **FR-021**: 작업 종료일은 시작일 + 일수로 자동 계산되어야 한다
- **FR-022**: 광고 상태 변경은 MASTER/AGENCY만 가능해야 한다

**UI/UX**
- **FR-023**: 좌측 사이드바(그린계열 배경, 약 240px 폭)와 상단 헤더(흰색 배경, 약 56px 높이) 레이아웃을 구현해야 한다
- **FR-024**: 헤더 좌측에 로고, 우측에 현재 사용자명과 드롭다운(프로필 수정, 로그아웃) 메뉴를 표시해야 한다
- **FR-025**: 모달은 중앙 흰 박스 + 어두운 오버레이 + 하단 버튼 2개(좌 outline, 우 primary) 구조로 구현해야 한다
- **FR-026**: 권한별로 사이드바 메뉴 노출을 다르게 해야 한다 (MASTER/AGENCY: 계정관리+광고관리, ADVERTISER: 광고관리+프로필)
- **FR-027**: 테이블에서 체크박스 선택, 정렬 아이콘, 관리 아이콘을 지원해야 한다
- **FR-028**: 등록/수정/삭제 성공/실패 시 토스트 알림을 표시해야 한다
- **FR-029**: 본문 영역은 카드와 테이블 중심으로, 흰색 배경 + 얇은 보더 + 약한 그림자로 구현해야 한다

**데이터 초기화**
- **FR-030**: 시드 데이터로 기본 organization("알파")과 3개의 테스트 계정이 생성되어야 한다
- **FR-031**: 시드 데이터로 다양한 상태(정상/오류/대기/종료예정/종료)의 광고 7개 이상이 생성되어야 한다

### Key Entities

- **Organization**: 소속 단위. AGENCY/ADVERTISER가 속하는 조직이다. (id, name)
- **User**: 시스템 사용자. MASTER는 organizationId가 null이고, AGENCY/ADVERTISER는 organizationId를 가진다. (id, organizationId, username, password, role, memo, createdAt). role은 MASTER/AGENCY/ADVERTISER 중 하나
- **Ad**: 광고 정보. organizationId로 데이터 격리. (id, organizationId, advertiserId, kind(PAID/TEST), status(WAITING/ACTIVE/ERROR/ENDING_SOON/ENDED), keyword, rank, productName, productId, quantity, workingDays, startDate, endDate, createdAt, updatedAt)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 사용자는 로그인 후 3초 이내에 대시보드 페이지에 진입할 수 있다
- **SC-002**: 계정관리 페이지에서 100개 이상의 계정 목록을 1초 이내에 조회할 수 있다
- **SC-003**: 광고관리 페이지에서 상태별 필터 전환 시 0.5초 이내에 테이블이 갱신된다
- **SC-004**: 신규 계정/광고 등록 후 테이블이 자동으로 갱신되어 추가된 항목이 즉시 표시된다
- **SC-005**: 권한이 없는 작업 시도 시 명확한 오류 메시지가 표시되고, 해당 UI 요소가 사전에 숨겨진다
- **SC-006**: 참조 캡처 화면과 동일한 레이아웃/색상/간격의 UI가 구현된다
- **SC-007**: 타입 에러/린트 에러 없이 애플리케이션이 정상 실행된다

## Assumptions

- 시드 데이터로 기본 organization("알파")과 3개의 테스트 계정(MASTER: specter/0000, AGENCY: alpha/0000 소속=알파, ADVERTISER: yellow/0000 소속=알파)이 생성된다
- MASTER 계정(specter)은 organizationId가 null이며, 모든 organization의 데이터를 관리한다
- 초기에는 실제 DB 연결 없이 임시 데이터로 UI 동작을 확인하며, 추후 Supabase PostgreSQL을 연결한다
- 페이지네이션은 UI만 구현하고, 실제 동작은 단일 페이지로 고정해도 된다
- MASTER가 AGENCY를 등록할 때 기존 organization을 선택하거나 새 organization 이름을 입력하여 생성한다
- username은 유일해야한다.


## Technical Context (Reference Only)

> 아래 내용은 요구사항 문서에 명시된 기술 스택으로, 구현 시 참고용이다.

- Next.js (App Router) + TypeScript
- TailwindCSS
- Prisma ORM
- Supabase PostgreSQL (추후 연결)
- HTTP-only Cookie 기반 세션
- bcrypt 비밀번호 해싱
- Supabase RLS 비활성화
