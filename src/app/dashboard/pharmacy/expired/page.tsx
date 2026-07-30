import { getValidatedUserWithPermission } from '@/actions/auth.actions';
import { ExpiredBatchesPage } from '@/components/expired';

export default async function FarmaciaVencidosPage() {
  await getValidatedUserWithPermission('pharmacy', 'view');

  return <ExpiredBatchesPage location="farmacia" />;
}
