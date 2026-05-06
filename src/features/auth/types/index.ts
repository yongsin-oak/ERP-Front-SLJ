export type Role = 'SuperAdmin' | 'Admin' | 'Operator' | 'Warehouse' | 'Accountant' | 'HR' | 'Marketing' | 'Sales';

export interface AuthUser {
  sub?: string;
  username?: string;
  terminalCode?: string;
  name?: string;
  role: Role;
  type?: 'user' | 'terminal';
  isTerminal?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuth: boolean;
  isLoadingUser: boolean;
}

export interface ActorToken {
  actorToken: string;
  expiresIn: number;
  employee: {
    id: string;
    name: string;
    role: Role;
  };
}
