import { Card } from '@/components/ui/card';
import { ProductForm } from '@/components/products/ProductForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';

export default async function NewProductPage() {
  // Verificar permisos: solo usuarios con permiso 'create' en products
  await getValidatedUserWithPermission('products', 'create');
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Producto</h1>
          <p className="text-muted-foreground">
            Registra un nuevo producto en el inventario del hospital
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <ProductForm />
      </Card>
    </div>
  );
}
