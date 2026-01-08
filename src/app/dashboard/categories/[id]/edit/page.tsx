import { Card } from '@/components/ui/card';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { getCategoryByIdAction } from '@/actions/category.actions';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  // Verificar permisos: solo usuarios con permiso 'edit' en categories
  await getValidatedUserWithPermission('categories', 'edit');

  const { id } = await params;
  const response = await getCategoryByIdAction(id);

  if ('error' in response) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/categories">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Categoría</h1>
          <p className="text-muted-foreground">
            Modifica la información de la categoría: {response.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <CategoryForm category={response} isEditing />
      </Card>
    </div>
  );
}
