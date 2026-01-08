import { UsersPage } from '@/components/users';
import { getUsersAction } from '@/actions/user.actions';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';
import { hasPermission } from '@/lib/permissions';

export default async function UsersListPage() {
  // Verificar permisos: solo usuarios con acceso a 'users' pueden ver
  const user = await getValidatedUserWithPermission('users', 'view');

  // Verificar si puede crear/editar usuarios
  const canManageUsers = hasPermission(user.roles, 'users', 'create');

  const response = await getUsersAction();

  // Si hay error, mostramos lista vacía
  const initialUsers = 'error' in response ? [] : response.data;

  return <UsersPage initialUsers={initialUsers} isAdmin={canManageUsers} />;
}
