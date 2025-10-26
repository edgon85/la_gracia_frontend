import { LoginForm } from '@/components/auth/login-form';
import { getCurrentUser } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  // Si el usuario ya está autenticado, redirigir al dashboard
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoginForm />
    </div>
  );
}