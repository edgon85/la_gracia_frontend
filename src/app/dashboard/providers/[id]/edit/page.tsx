import { Card } from '@/components/ui/card';
import { ProviderForm } from '@/components/providers/ProviderForm';
import { getProviderByIdAction } from '@/actions/provider.actions';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

interface EditProviderPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProviderPage({ params }: EditProviderPageProps) {
  // Verificar permisos: solo usuarios con permiso 'edit' en providers
  await getValidatedUserWithPermission('providers', 'edit');

  const { id } = await params;
  const response = await getProviderByIdAction(id);

  if ('error' in response) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/providers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Proveedor</h1>
          <p className="text-muted-foreground">
            Modifica la información del proveedor: {response.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <ProviderForm provider={response} isEditing />
      </Card>
    </div>
  );
}
