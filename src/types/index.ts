export type Role = 'MASTER' | 'AGENCY' | 'ADVERTISER';

export type AdKind = 'PAID' | 'TEST';

export type AdStatus = 'WAITING' | 'ACTIVE' | 'ERROR' | 'ENDING_SOON' | 'ENDED';

export interface Organization {
  id: number;
  name: string;
  createdAt: string;
}

export interface User {
  id: number;
  organizationId: number | null;
  organizationName?: string | null;
  username: string;
  role: Role;
  memo: string | null;
  createdAt: string;
  adCount?: number;
}

export interface Ad {
  id: number;
  organizationId: number;
  advertiserId: number;
  advertiserUsername?: string;
  kind: AdKind;
  status: AdStatus;
  keyword: string | null;
  rank: number | null;
  productName: string | null;
  productId: string | null;
  quantity: number | null;
  workingDays: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionPayload {
  id: number;
  username: string;
  role: Role;
  organizationId: number | null;
}

export interface AccountStats {
  total: number;
  master: number;
  agency: number;
  advertiser: number;
}

export interface AdStats {
  total: number;
  active: number;
  error: number;
  waiting: number;
  endingSoon: number;
  ended: number;
}

export interface AdStatsGroup {
  all: AdStats;
  paid: AdStats;
  test: AdStats;
}
