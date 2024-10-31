export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'MEDICAL_WRITER';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface Permission {
  action: 'create' | 'read' | 'update' | 'delete';
  resource: 'quotation' | 'price_table' | 'company' | 'product' | 'user';
}

// 각 역할별 권한 정의
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    // 모든 리소스에 대한 모든 권한
    { action: 'create', resource: 'quotation' },
    { action: 'read', resource: 'quotation' },
    { action: 'update', resource: 'quotation' },
    { action: 'delete', resource: 'quotation' },
    { action: 'create', resource: 'price_table' },
    { action: 'read', resource: 'price_table' },
    { action: 'update', resource: 'price_table' },
    { action: 'delete', resource: 'price_table' },
    { action: 'create', resource: 'company' },
    { action: 'read', resource: 'company' },
    { action: 'update', resource: 'company' },
    { action: 'delete', resource: 'company' },
    { action: 'create', resource: 'product' },
    { action: 'read', resource: 'product' },
    { action: 'update', resource: 'product' },
    { action: 'delete', resource: 'product' },
    { action: 'create', resource: 'user' },
    { action: 'read', resource: 'user' },
    { action: 'update', resource: 'user' },
    { action: 'delete', resource: 'user' },
  ],
  PROJECT_MANAGER: [
    // 견적서 관련 모든 권한
    { action: 'create', resource: 'quotation' },
    { action: 'read', resource: 'quotation' },
    { action: 'update', resource: 'quotation' },
    { action: 'delete', resource: 'quotation' },
    // 단가표 읽기 권한만
    { action: 'read', resource: 'price_table' },
    // 회사/제품 읽기 권한만
    { action: 'read', resource: 'company' },
    { action: 'read', resource: 'product' },
  ],
  MEDICAL_WRITER: [
    // 공유받은 견적서에 대한 읽기/수정 권한
    { action: 'read', resource: 'quotation' },
    { action: 'update', resource: 'quotation' },
    // 단가표 읽기 권한
    { action: 'read', resource: 'price_table' },
    // 회사/제품 읽기 권한
    { action: 'read', resource: 'company' },
    { action: 'read', resource: 'product' },
  ],
};