import { AddProductOrBatch } from '@/components/products/AddProductOrBatch';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';

export default async function NewPharmacyProductPage() {
  await getValidatedUserWithPermission('pharmacy', 'create');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/pharmacy/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agregar Producto</h1>
          <p className="text-muted-foreground">
            Agrega un nuevo producto o lote al inventario de farmacia
          </p>
        </div>
      </div>

      {/* Form */}
      <AddProductOrBatch location="farmacia" />
    </div>
  );
}
