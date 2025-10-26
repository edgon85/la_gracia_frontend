'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
// Tipos temporales hasta que se definan las interfaces
import { ILoginRequest, IRegisterRequest, IAuthResponse, IUser } from '@/lib';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper para manejar errores
function handleError(error: any) {
  if (error instanceof Error) {
    return { error: error.message };
  }
  return { error: 'Error desconocido' };
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
    console.log(data);
    
    // Guardar token en cookies (httpOnly para mayor seguridad)
    (await cookies()).set('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

  // Guardar user en cookies (no httpOnly para poder leerlo en el cliente)
    // Removemos el token antes de guardarlo
    const { token, ...userWithoutToken } = data;
    (await cookies()).set('user', JSON.stringify(userWithoutToken), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, user: userWithoutToken };
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

    // Guardar token y user en cookies
    (await cookies()).set('token', responseData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    const { token, ...userWithoutToken } = responseData;
    (await cookies()).set('user', JSON.stringify(userWithoutToken), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, user: userWithoutToken };
  } catch (error) {
    return handleError(error);
  }
}

// Logout Action
export async function logoutAction() {
  (await cookies()).delete('token');
  (await cookies()).delete('user');
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
