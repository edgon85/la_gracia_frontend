import { MovementsPage } from '@/components/inventory';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';

export default async function SettingsMovementsPage() {
  await getValidatedUserWithPermission('settings', 'view');

  return <MovementsPage />;
}
