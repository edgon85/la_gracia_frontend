import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Cache para evitar validaciones excesivas (en memoria del edge runtime)
const tokenValidationCache = new Map<string, { valid: boolean; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minuto

async function validateToken(token: string): Promise<boolean> {
  // Verificar cache primero
  const cached = tokenValidationCache.get(token);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.valid;
  }

  try {
    const response = await fetch(`${API_URL}/auth/check-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const valid = response.ok;

    // Guardar en cache
    tokenValidationCache.set(token, { valid, timestamp: Date.now() });

    // Limpiar cache viejo (mantener máximo 100 entradas)
    if (tokenValidationCache.size > 100) {
      const oldestKey = tokenValidationCache.keys().next().value;
      if (oldestKey) tokenValidationCache.delete(oldestKey);
    }

    return valid;
  } catch {
    // En caso de error de red, permitir el acceso y dejar que la página maneje el error
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Rutas públicas
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Si está en una ruta pública
  if (isPublicRoute) {
    if (token) {
      // Verificar si el token es válido antes de redirigir al dashboard
      const isValid = await validateToken(token);
      if (isValid) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else {
        // Token inválido - limpiar cookies y permitir acceso a login
        const response = NextResponse.next();
        response.cookies.delete('token');
        response.cookies.delete('user');
        return response;
      }
    }
    return NextResponse.next();
  }

  // Si está en una ruta protegida
  if (pathname !== '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Validar token con el backend
    const isValid = await validateToken(token);
    if (!isValid) {
      // Token expirado o inválido - limpiar cookies y redirigir a login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      response.cookies.delete('user');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
