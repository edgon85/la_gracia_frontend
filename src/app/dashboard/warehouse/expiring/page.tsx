import { getValidatedUserWithPermission } from '@/actions/auth.actions';
import { ExpiringBatchesPage } from '@/components/expiring';

export default async function BodegaVencimientoPage() {
  await getValidatedUserWithPermission('warehouse', 'view');

  return <ExpiringBatchesPage location="bodega" />;
}
