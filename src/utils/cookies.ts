// Helper para leer cookies desde el cliente
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }

  return null;
}

export function getUserFromCookie() {
  const userCookie = getCookie('user');

  if (!userCookie) return null;

  try {
    // Decodificar la cookie URL-encoded antes de parsear
    const decodedCookie = decodeURIComponent(userCookie);
    const parsed = JSON.parse(decodedCookie);
    return parsed;
  } catch (error) {
    console.log('Error parsing user cookie:', error);
    return null;
  }
}
