export interface MemberAuthResponse {
  type: 'member';
  token: string;
  refreshToken: string;
  member: { id: string; name: string; email: string; status: string };
  role: string;
  permissions: string[];
  business: { id: string; name: string; subdomain: string; mode: string };
}

export interface CustomerAuthResponse {
  type: 'customer';
  token: string;
  refreshToken: string;
  customer: { id: string; firstName: string; lastName: string | null; email: string | null };
  business: { id: string; name: string; subdomain: string; mode: string };
}

export type LoginResponse = MemberAuthResponse | CustomerAuthResponse;
