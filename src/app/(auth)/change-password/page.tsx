import { ChangePasswordForm } from '@/components/auth/change-password-form';
import { getCurrentUser } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    redirect('/login');
  }

  // Si el usuario no necesita cambiar contraseña, redirigir al dashboard
  if (!user.mustResetPassword) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <ChangePasswordForm />
    </div>
  );
}
