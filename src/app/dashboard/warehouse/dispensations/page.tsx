import { DispensationPage } from '@/components/dispensation';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';

export default async function BodegaDespachosPage() {
  await getValidatedUserWithPermission('warehouse', 'view');

  return <DispensationPage location="bodega" />;
}
