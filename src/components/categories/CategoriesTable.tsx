'use client';

import { useRouter } from 'next/navigation';
import { ICategory } from '@/lib';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoriesTableProps {
  categories: ICategory[];
  onSort?: (field: string) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export function CategoriesTable({
  categories,
  onSort,
  sortField,
  sortOrder,
}: CategoriesTableProps) {
  const router = useRouter();

  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/categories/${id}/edit`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('name')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Nombre
                {getSortIcon('name')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('code')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Código
                {getSortIcon('code')}
              </Button>
            </TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No se encontraron categorías.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{category.code}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground" title={category.description}>
                  {category.description}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded border"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-muted-foreground">{category.color}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {category.isActive ? (
                    <Badge className="bg-green-500">Activo</Badge>
                  ) : (
                    <Badge variant="destructive">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(category.id)}
                    title="Editar categoría"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
