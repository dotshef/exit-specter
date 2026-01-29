import { Role } from '@/types';

export function canViewNotices(role: Role): boolean {
  return role === 'MASTER' || role === 'AGENCY' || role === 'ADVERTISER';
}

export function canManageNotices(role: Role): boolean {
  return role === 'MASTER';
}

export function canManageAccounts(role: Role): boolean {
  return role === 'MASTER' || role === 'AGENCY';
}

export function canManageAds(role: Role): boolean {
  return role === 'MASTER' || role === 'AGENCY';
}

export function canDeleteAccounts(role: Role): boolean {
  return role === 'MASTER' || role === 'AGENCY';
}

export function canCreateAccounts(role: Role): boolean {
  return role === 'MASTER' || role === 'AGENCY';
}

export function getCreateableRoles(role: Role): Role[] {
  if (role === 'MASTER') return ['AGENCY', 'ADVERTISER'];
  if (role === 'AGENCY') return ['ADVERTISER'];
  return [];
}

export function getDataScope(role: Role, organizationId: number | null): { where: Record<string, unknown> } {
  if (role === 'MASTER') {
    return { where: {} };
  }
  return { where: { organizationId } };
}

export function getRedirectPath(role: Role): string {
  if (role === 'MASTER') return '/accounts';
  return '/ads';
}

export function getSidebarItems(role: Role): { label: string; href: string; icon: string }[] {
  const items: { label: string; href: string; icon: string }[] = [];

  // 모든 역할이 공지사항 볼 수 있음
  items.push({ label: '공지사항', href: '/notices', icon: 'notices' });

  // 모든 역할이 계정관리 볼 수 있음 (ADVERTISER는 읽기 전용)
  items.push({ label: '계정관리', href: '/accounts', icon: 'accounts' });

  items.push({ label: '광고관리', href: '/ads', icon: 'ads' });

  return items;
}
