import { UserForm } from '@/components/users';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function NewUserPage() {
  // Verificar permisos: solo usuarios con permiso 'create' en users
  await getValidatedUserWithPermission('users', 'create');

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
