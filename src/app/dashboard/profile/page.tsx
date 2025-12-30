import { getCurrentUser } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';
import { ProfilePage } from '@/components/profile/ProfilePage';

export default async function Profile() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <ProfilePage user={user} />;
}
