import { getBackupsAction } from '@/actions/backup.actions';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';
import { BackupsPage } from '@/components/settings/backups/BackupsPage';

export default async function BackupsRoutePage() {
  // Verificar permisos: solo usuarios con acceso a 'settings' pueden ver
  await getValidatedUserWithPermission('settings', 'view');

  const response = await getBackupsAction();

  if ('error' in response) {
    console.error('Error fetching initial backups:', response.error);
    return <BackupsPage initialData={{ data: [], total: 0 }} />;
  }

  return <BackupsPage initialData={response} />;
}
