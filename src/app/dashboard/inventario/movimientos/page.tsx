import { MovementsPage } from '@/components/inventory';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';

export default async function InventarioMovimientosPage() {
  await getValidatedUserWithPermission('products', 'view');

  return <MovementsPage />;
}
