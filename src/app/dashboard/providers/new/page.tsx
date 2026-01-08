import { Card } from '@/components/ui/card';
import { ProviderForm } from '@/components/providers/ProviderForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';

export default async function NewProviderPage() {
  // Verificar permisos: solo usuarios con permiso 'create' en providers
  await getValidatedUserWithPermission('providers', 'create');
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
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Proveedor</h1>
          <p className="text-muted-foreground">
            Registra un nuevo proveedor para el hospital
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <ProviderForm />
      </Card>
    </div>
  );
}
