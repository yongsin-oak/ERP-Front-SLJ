export type Role = 'SuperAdmin' | 'Admin' | 'Operator' | 'Warehouse' | 'Accountant' | 'HR' | 'Marketing' | 'Sales';

export interface AuthUser {
  sub?: string;
  username: string;
  role: Role;
}

export interface AuthState {
  user: AuthUser | null;
  isAuth: boolean;
  isLoadingUser: boolean;
}
