import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth.actions';

export default async function Home() {
  const user = await getCurrentUser();

  redirect(user ? '/dashboard' : '/login');
}
