export enum Role {
  ADMIN = 'admin',
  FARMACIA = 'FARMACIA',
  BODEGA = 'BODEGA',
  MEDICO = 'MEDICO',
  ENFERMERO = 'ENFERMERO',
  AUDITOR = 'AUDITOR',
}

export interface IUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
  token: string;
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
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}
