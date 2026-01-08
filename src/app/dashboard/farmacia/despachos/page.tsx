import { DispensationPage } from '@/components/dispensation';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';

export default async function DespachosPage() {
  // Verificar permisos: solo usuarios con acceso a 'pharmacy' pueden ver
  await getValidatedUserWithPermission('pharmacy', 'view');

  return <DispensationPage />;
}
