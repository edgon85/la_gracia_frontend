import { Card } from '@/components/ui/card';
import { ProductForm } from '@/components/products/ProductForm';
import { getProductByIdAction } from '@/actions/product.actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const response = await getProductByIdAction(id);

  if ('error' in response) {
    notFound();
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Editar Producto</h1>
          <p className="text-muted-foreground">
            Modifica la información del producto: {response.commercialName}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <ProductForm product={response} isEditing />
      </Card>
    </div>
  );
}
