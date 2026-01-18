'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IProvider } from '@/lib';
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
import { ProviderDetailModal } from './ProviderDetailModal';

interface ProvidersTableProps {
  providers: IProvider[];
  onSort?: (field: string) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onRefresh?: () => void;
}

export function ProvidersTable({
  providers,
  onSort,
  sortField,
  sortOrder,
  onRefresh,
}: ProvidersTableProps) {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState<IProvider | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenDetail = (provider: IProvider) => {
    setSelectedProvider(provider);
    setIsDetailOpen(true);
  };

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
    router.push(`/dashboard/providers/${id}/edit`);
  };

  return (
    <>
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
            <TableHead>NIT</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Persona de Contacto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No se encontraron proveedores.
              </TableCell>
            </TableRow>
          ) : (
            providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell>
                  <button
                    onClick={() => handleOpenDetail(provider)}
                    className="font-medium text-left hover:text-primary hover:underline cursor-pointer transition-colors"
                  >
                    {provider.name}
                  </button>
                </TableCell>
                <TableCell>{provider.nit}</TableCell>
                <TableCell>{provider.phone}</TableCell>
                <TableCell className="text-muted-foreground">
                  {provider.email}
                </TableCell>
                <TableCell>{provider.contactPerson}</TableCell>
                <TableCell>
                  {provider.isActive ? (
                    <Badge className="bg-green-500">Activo</Badge>
                  ) : (
                    <Badge variant="destructive">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(provider.id)}
                    title="Editar proveedor"
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

      <ProviderDetailModal
        provider={selectedProvider}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onContactAdded={onRefresh}
      />
    </>
  );
}
