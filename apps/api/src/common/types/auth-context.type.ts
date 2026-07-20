import { BusinessMode } from '@prisma/client';

export interface MemberContext {
  type: 'member';
  memberId: string;
  businessId: string;
  businessMode: BusinessMode;
  roleId: string;
  roleName: string;
  permissions: string[];
}

export interface CustomerContext {
  type: 'customer';
  customerId: string;
  businessId: string;
  businessMode: BusinessMode;
}

export type AuthContext = MemberContext | CustomerContext;
