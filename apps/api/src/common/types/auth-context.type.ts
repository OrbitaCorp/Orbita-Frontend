import { BusinessMode } from '@prisma/client';

export interface MemberContext {
  authUserId: string;
  type: 'member';
  memberId: string;
  businessId: string;
  businessMode: BusinessMode;
  roleId: string;
  roleName: string;
  permissions: string[];
}

export interface CustomerContext {
  authUserId: string;
  type: 'customer';
  customerId: string;
  businessId: string;
  businessMode: BusinessMode;
}

export type AuthContext = MemberContext | CustomerContext;
