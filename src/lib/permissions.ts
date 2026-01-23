import { Role } from '@/types';

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

  if (role === 'MASTER' || role === 'AGENCY') {
    items.push({ label: '계정관리', href: '/accounts', icon: 'accounts' });
  }

  items.push({ label: '광고관리', href: '/ads', icon: 'ads' });

  return items;
}
