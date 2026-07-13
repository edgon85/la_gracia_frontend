'use server';

import { IBackupsListResponse, ICreateBackupResponse, IBackupUrlResponse } from '@/lib';
import { getToken } from './auth.actions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getBackupsAction(): Promise<IBackupsListResponse | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/backups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al obtener los respaldos',
      };
    }

    const data: IBackupsListResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching backups:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function createBackupAction(): Promise<
  { success: true; backup: ICreateBackupResponse } | { error: string }
> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/backups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al crear el respaldo',
      };
    }

    const backup: ICreateBackupResponse = await response.json();
    return { success: true, backup };
  } catch (error) {
    console.error('Error creating backup:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function getBackupDownloadUrlAction(
  key: string
): Promise<{ success: true; url: string } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/backups/${encodeURIComponent(key)}/url`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al generar el enlace de descarga',
      };
    }

    const data: IBackupUrlResponse = await response.json();
    return { success: true, url: data.url };
  } catch (error) {
    console.error('Error getting backup download URL:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

export async function deleteBackupAction(
  key: string
): Promise<{ success: true; message: string } | { error: string }> {
  try {
    const token = await getToken();

    if (!token) {
      return { error: 'No autenticado' };
    }

    const response = await fetch(`${API_URL}/backups/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error: errorData.message || 'Error al eliminar el respaldo',
      };
    }

    const data: { message: string } = await response.json();
    return { success: true, message: data.message || 'Respaldo eliminado correctamente' };
  } catch (error) {
    console.error('Error deleting backup:', error);
    return {
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
