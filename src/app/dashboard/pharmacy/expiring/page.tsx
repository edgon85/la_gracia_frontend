import { getValidatedUserWithPermission } from '@/actions/auth.actions';
import { ExpiringBatchesPage } from '@/components/expiring';

export default async function FarmaciaVencimientoPage() {
  await getValidatedUserWithPermission('pharmacy', 'view');

  return <ExpiringBatchesPage location="farmacia" />;
}
