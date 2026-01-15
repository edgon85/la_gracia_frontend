import { DispensationPage } from '@/components/dispensation';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';

export default async function FarmaciaDespachosPage() {
  await getValidatedUserWithPermission('pharmacy', 'view');

  return <DispensationPage location="farmacia" />;
}
