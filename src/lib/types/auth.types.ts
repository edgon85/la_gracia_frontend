export enum Role {
  ADMIN = 'admin',
  PHARMACY = 'pharmacy',
  WAREHOUSE = 'warehouse',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  AUDITOR = 'auditor',
  USER = 'user',
}

export interface IUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
  token: string;
  mustResetPassword?: boolean;
}

export interface IChangePasswordRequest {
  newPassword: string;
}

export interface IUpdateProfileRequest {
  fullName?: string;
  email?: string;
}

export interface IChangePasswordVoluntaryRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ILoginRequest {
  identifier: string;
  password: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

// Tu API devuelve directamente el usuario con el token
export type IAuthResponse = IUser;

export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData?: Partial<IUser>) => Promise<void>;
  register: () => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  updateUser: (userData: Partial<IUser>) => void;
}
