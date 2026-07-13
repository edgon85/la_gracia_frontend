import { getValidatedUserWithPermission } from '@/actions/auth.actions';
import { SettingsPage } from '@/components/settings/SettingsPage';

export default async function SettingsRoutePage() {
  // Verificar permisos: solo usuarios con acceso a 'settings' pueden ver
  await getValidatedUserWithPermission('settings', 'view');

  return <SettingsPage />;
}
