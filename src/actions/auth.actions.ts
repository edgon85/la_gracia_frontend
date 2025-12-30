'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
// Tipos temporales hasta que se definan las interfaces
import {
  ILoginRequest,
  IRegisterRequest,
  IAuthResponse,
  IUser,
  IChangePasswordRequest,
  IUpdateProfileRequest,
  IChangePasswordVoluntaryRequest,
} from '@/lib';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper para manejar errores
function handleError(error: unknown) {
  if (error instanceof Error) {
    return { error: error.message };
  }
  return { error: 'Error desconocido' };
}

// Helper para guardar auth cookies
async function setAuthCookies(data: IAuthResponse) {
  const cookieStore = await cookies();

  // Guardar token en cookies (httpOnly para mayor seguridad)
  cookieStore.set('token', data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });

  // Guardar user en cookies (no httpOnly para poder leerlo en el cliente)
  const { token, ...userWithoutToken } = data;
  cookieStore.set('user', JSON.stringify(userWithoutToken), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  return userWithoutToken;
}

// Helper para limpiar auth cookies
async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('user');
}

// Login Action
export async function loginAction(credentials: ILoginRequest) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al iniciar sesión',
      };
    }

    const data: IAuthResponse = await response.json();
    const user = await setAuthCookies(data);

    return {
      success: true,
      user,
      mustResetPassword: data.mustResetPassword ?? false,
    };
  } catch (error) {
    return handleError(error);
  }
}

// Register Action
export async function registerAction(data: IRegisterRequest) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al registrarse',
      };
    }

    const responseData: IAuthResponse = await response.json();
    const user = await setAuthCookies(responseData);

    return { success: true, user };
  } catch (error) {
    return handleError(error);
  }
}

// Logout Action
export async function logoutAction() {
  await clearAuthCookies();
  redirect('/login');
}

// Get Current User (desde cookies)
export async function getCurrentUser(): Promise<IUser | null> {
  const userCookie = (await cookies()).get('user');

  if (!userCookie) {
    return null;
  }

  try {
    return JSON.parse(userCookie.value);
  } catch {
    return null;
  }
}

// Verificar autenticación
export async function checkAuth(): Promise<boolean> {
  const token = (await cookies()).get('token');
  return !!token;
}

// Obtener token (para llamadas API desde el servidor)
export async function getToken(): Promise<string | null> {
  const token = (await cookies()).get('token');
  return token?.value || null;
}

// Verificar estado de autenticación con el backend (SIN actualizar cookies)
// Usa esto para validar que el token sigue siendo válido
export async function verifyTokenAction(): Promise<
  { valid: true; user: Omit<IUser, 'token'> } | { valid: false; error: string }
> {
  try {
    const token = await getToken();

    if (!token) {
      return { valid: false, error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/auth/check-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      // Token inválido o expirado - limpiar cookies
      await clearAuthCookies();
      return { valid: false, error: 'Sesión expirada o inválida' };
    }

    const data: IAuthResponse = await response.json();
    const { token: _, ...userWithoutToken } = data;

    return { valid: true, user: userWithoutToken };
  } catch (error) {
    const err = handleError(error);
    return { valid: false, error: err.error };
  }
}

// Verificar estado y REFRESCAR token (actualiza cookies)
// Usa esto cuando necesites refrescar el token explícitamente
export async function refreshTokenAction(): Promise<
  { success: true; user: Omit<IUser, 'token'> } | { error: string }
> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/auth/check-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      await clearAuthCookies();
      return { error: 'Sesión expirada o inválida' };
    }

    const data: IAuthResponse = await response.json();

    // Actualizar cookies con el nuevo token
    const user = await setAuthCookies(data);

    return { success: true, user };
  } catch (error) {
    return handleError(error);
  }
}

// Obtener usuario validado con el backend (sin modificar cookies)
// Usa esto en páginas protegidas para verificar que el token es válido
export async function getValidatedUser(): Promise<Omit<IUser, 'token'> | null> {
  const result = await verifyTokenAction();

  if (!result.valid) {
    return null;
  }

  return result.user;
}

// Change Password Action
// Usado cuando mustResetPassword es true después del login
export async function changePasswordAction(data: IChangePasswordRequest) {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al cambiar la contraseña',
      };
    }

    // Actualizar la cookie del usuario para quitar mustResetPassword
    const userCookie = (await cookies()).get('user');
    if (userCookie) {
      const user = JSON.parse(userCookie.value);
      user.mustResetPassword = false;
      const cookieStore = await cookies();
      cookieStore.set('user', JSON.stringify(user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

// Update Profile Action
// Permite al usuario actualizar su nombre y email
export async function updateProfileAction(data: IUpdateProfileRequest) {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al actualizar el perfil',
      };
    }

    const updatedUser: IAuthResponse = await response.json();

    // Actualizar la cookie del usuario con los nuevos datos
    const userCookie = (await cookies()).get('user');
    if (userCookie) {
      const currentUser = JSON.parse(userCookie.value);
      const newUserData = {
        ...currentUser,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
      };
      const cookieStore = await cookies();
      cookieStore.set('user', JSON.stringify(newUserData), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return { success: true, user: updatedUser };
  } catch (error) {
    return handleError(error);
  }
}

// Change Password Voluntary Action
// Permite al usuario cambiar su contraseña voluntariamente desde el perfil
// Usa PATCH /auth/profile con currentPassword y password
export async function changePasswordVoluntaryAction(
  data: IChangePasswordVoluntaryRequest
) {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al cambiar la contraseña',
      };
    }

    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}
