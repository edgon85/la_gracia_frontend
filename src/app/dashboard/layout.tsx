import DashboardLayout from '@/components/layout/DashboardLayout';
import { getCurrentUser } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Si no hay usuario, redirigir al login
  if (!user) {
    redirect('/login');
  }

  // Si el usuario debe cambiar su contraseña, redirigir a change-password
  if (user.mustResetPassword) {
    redirect('/change-password');
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
