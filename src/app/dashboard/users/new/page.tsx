import { Card } from '@/components/ui/card';
import { UserForm } from '@/components/users';
import { getValidatedUser } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function NewUserPage() {
  const user = await getValidatedUser();

  if (!user) {
    redirect('/login');
  }

  // Solo administradores pueden crear usuarios
  const isAdmin = user.roles.includes('admin');

  if (!isAdmin) {
    redirect('/dashboard/users');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Usuario</h1>
          <p className="text-muted-foreground">
            Crea una nueva cuenta de usuario en el sistema
          </p>
        </div>
      </div>

      <UserForm />
    </div>
  );
}
