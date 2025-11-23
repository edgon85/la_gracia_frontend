import { Card } from '@/components/ui/card';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewCategoryPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Nueva Categoría</h1>
          <p className="text-muted-foreground">
            Crea una nueva categoría para organizar los productos
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <CategoryForm />
      </Card>
    </div>
  );
}
