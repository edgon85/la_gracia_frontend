import { redirect } from 'next/navigation';
import { getValidatedUser } from '@/actions/auth.actions';

export default async function Home() {
  const user = await getValidatedUser();

  redirect(user ? '/dashboard' : '/login');
}
