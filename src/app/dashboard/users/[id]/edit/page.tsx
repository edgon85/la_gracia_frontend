import { UserForm } from '@/components/users';
import { getUserByIdAction } from '@/actions/user.actions';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  // Verificar permisos: solo usuarios con permiso 'edit' en users
  await getValidatedUserWithPermission('users', 'edit');

  const { id } = await params;
  const response = await getUserByIdAction(id);

  if ('error' in response) {
    notFound();
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
          <h1 className="text-3xl font-bold tracking-tight">Editar Usuario</h1>
          <p className="text-muted-foreground">
            Modifica la información de: {response.fullName}
          </p>
        </div>
      </div>

      <UserForm user={response} isEditing />
    </div>
  );
}
