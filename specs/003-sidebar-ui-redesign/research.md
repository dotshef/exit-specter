# Research: 좌측 메뉴 UI 재설계

**Feature**: 003-sidebar-ui-redesign
**Date**: 2026-01-27

## 1. 현재 구현 분석

### 1.1 기존 Sidebar 구조

**파일**: `src/components/layout/Sidebar.tsx`

**현재 상태**:
- 배경색: `bg-[var(--sidebar-bg)]` → `#1F5D3B` (어두운 녹색)
- 텍스트: 흰색/회색 계열
- 위치: `fixed left-0 top-[56px]` (헤더 아래 시작)
- 너비: `w-[180px]`
- 메뉴 항목: `getSidebarItems(role)`에서 동적으로 생성
- 선택 상태: `bg-white/10` (반투명 흰색)

**변경 필요 사항**:
- 배경색 흰색으로 변경
- 상단 헤더 없이 top-0부터 시작
- 로고, 프로필, 로그아웃 추가
- 선택 상태 스타일 변경

### 1.2 기존 Header 구조

**파일**: `src/components/layout/Header.tsx`

**현재 상태**:
- 로고 표시 (K-168.png)
- username + role 표시
- 프로필 수정 버튼
- 로그아웃 버튼

**변경 사항**:
- Header 컴포넌트는 더 이상 렌더링하지 않음
- 기존 기능들을 Sidebar로 이전

### 1.3 Protected Layout

**파일**: `src/app/(protected)/layout.tsx`

**현재 상태**:
- Header와 Sidebar 모두 렌더링
- main 영역: `ml-[180px] mt-[56px]`

**변경 사항**:
- Header 렌더링 제거
- Sidebar에 username, role props 전달
- main 영역: `ml-[240px] mt-0`

## 2. Reference 이미지 분석

### 2.1 대시보드화면.png 분석

**사이드바 구조** (위에서 아래로):
1. 로고 영역: "ArkPlus Marketing Solution"
2. 프로필 카드: 아바타 + username + role + 통계
3. MENU 라벨
4. 메뉴 항목들:
   - 대시보드 (선택됨 - 파란색 배경 + rounded)
   - 광고관리
   - 공지사항
5. 하단 영역:
   - 도움말
   - 로그아웃
   - 버전 정보

**스타일**:
- 배경: 흰색
- 선택된 메뉴: 파란색 배경 (#3B82F6 또는 유사), rounded-lg, 화살표 아이콘
- 비선택 메뉴: 투명, 회색 텍스트
- 각 메뉴: 아이콘 + 메인 텍스트 + 서브 텍스트

### 2.2 광고관리화면.png 분석

- 동일한 사이드바 구조
- "광고관리" 메뉴가 선택된 상태

## 3. 디자인 결정사항

### Decision 1: 사이드바 배경색

**결정**: 흰색 (#FFFFFF) 배경 + 회색 border
**근거**: reference 이미지와 일관성, 현대적인 대시보드 UI 트렌드
**대안 검토**:
- 밝은 회색 (#F8F9FA) - 거부: reference 이미지가 순수 흰색 사용

### Decision 2: 선택된 메뉴 스타일

**결정**: primary color (#2E7D5A) 배경 + 흰색 텍스트 + rounded-lg + 좌측 padding
**근거**: task.md 요구사항 ("primary color로 표시하고 클릭 된 메뉴는 rounded를 적용")
**대안 검토**:
- 파란색 (#3B82F6) - 거부: task.md에서 primary color 유지 명시

### Decision 3: 메뉴 레이아웃

**결정**: 단순화된 구조 적용
- 로고 (상단)
- MENU 라벨 + 메뉴 항목들 (계정관리, 광고관리)
- 프로필 + 로그아웃 (하단, spacer로 분리)

**근거**: task.md 요구사항 ("홈 로고, 계정관리, 광고관리, 프로필, 로그아웃 순으로")
**대안 검토**:
- reference처럼 프로필을 상단에 배치 - 거부: task.md 명시 순서 우선

### Decision 4: 사이드바 너비

**결정**: 240px
**근거**: reference 이미지 비율 분석, 메뉴 텍스트 가독성
**대안 검토**:
- 180px (현재) - 거부: 프로필 정보 표시에 부족
- 260px - 거부: 콘텐츠 영역 과도하게 축소

### Decision 5: 호버 상태

**결정**: gray-100 (#F3F4F6) 배경 + rounded-lg
**근거**: task.md ("메뉴바 mouse hovering 색상은 gray 계열")
**대안 검토**:
- gray-200 - 거부: 너무 진함

## 4. 기술 구현 접근

### 4.1 Sidebar Props 확장

```typescript
interface SidebarProps {
  role: Role;
  username: string;  // 추가
}
```

### 4.2 Tailwind 클래스 매핑

| 요소 | 현재 | 변경 후 |
|------|------|---------|
| 사이드바 배경 | `bg-[var(--sidebar-bg)]` | `bg-white border-r border-gray-200` |
| 선택된 메뉴 | `bg-white/10` | `bg-[var(--primary)] text-white rounded-lg` |
| 비선택 메뉴 | `text-gray-300` | `text-gray-600` |
| 호버 | `hover:bg-white/5` | `hover:bg-gray-100 rounded-lg` |
| 위치 | `top-[56px]` | `top-0` |

### 4.3 로그아웃 기능 이전

Header의 `handleLogout` 함수 로직을 Sidebar로 이동:
```typescript
async function handleLogout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  router.push('/login');
}
```

## 5. 위험 요소 및 완화

| 위험 | 영향 | 완화 방안 |
|------|------|-----------|
| 기존 레이아웃 의존 코드 | 중간 | main 영역 margin 값만 변경, 다른 컴포넌트 영향 없음 |
| 반응형 미지원 | 낮음 | 스코프 외로 명시, 추후 별도 대응 |
| 세션 정보 접근 | 낮음 | layout.tsx에서 이미 session 가져오므로 props 전달만 필요 |

## 6. 결론

모든 "NEEDS CLARIFICATION" 항목이 해결되었습니다. 구현에 필요한 기술적 결정이 완료되었으며, Phase 1 설계로 진행 가능합니다.
