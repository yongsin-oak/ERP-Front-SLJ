export type Role = 'SuperAdmin' | 'Admin' | 'Operator' | 'Warehouse' | 'Accountant' | 'HR' | 'Marketing' | 'Sales';

export interface AuthUser {
  sub?: string;
  username?: string;
  terminalCode?: string;
  role: Role;
  isTerminal?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuth: boolean;
  isLoadingUser: boolean;
}

export interface ActorToken {
  actorToken: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    nickname: string;
  };
}
