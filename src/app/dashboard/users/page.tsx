import { UsersPage } from '@/components/users';
import { getUsersAction } from '@/actions/user.actions';
import { getValidatedUser } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';

export default async function UsersListPage() {
  const user = await getValidatedUser();

  if (!user) {
    redirect('/login');
  }

  const isAdmin = user.roles.includes('admin');

  const response = await getUsersAction();

  // Si hay error, mostramos lista vacía
  const initialUsers = 'error' in response ? [] : response.data;

  return <UsersPage initialUsers={initialUsers} isAdmin={isAdmin} />;
}
