'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IProduct } from '@/lib';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Pencil, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductDetailModal } from './ProductDetailModal';

interface ProductsTableProps {
  products: IProduct[];
  onSort?: (field: string) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onRefresh?: () => void;
}

export function ProductsTable({
  products,
  onSort,
  sortField,
  sortOrder,
  onRefresh,
}: ProductsTableProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetail = (product: IProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/products/${id}/edit`);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const formatPrice = (price: string) => {
    return `Q${parseFloat(price).toFixed(2)}`;
  };

  const getStockStatus = (product: IProduct) => {
    if (product.totalStock <= 0) {
      return <Badge variant="destructive">Sin stock</Badge>;
    }
    if (product.totalStock <= product.minimumStock) {
      return <Badge className="bg-yellow-500">Stock bajo</Badge>;
    }
    return <Badge className="bg-green-500">Disponible</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('internalCode')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Código
                {getSortIcon('internalCode')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('commercialName')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Nombre Comercial
                {getSortIcon('commercialName')}
              </Button>
            </TableHead>
            <TableHead>Nombre Genérico</TableHead>
            <TableHead>Presentación</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('totalStock')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Stock
                {getSortIcon('totalStock')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('price')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                Precio
                {getSortIcon('price')}
              </Button>
            </TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                No se encontraron productos.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const mainBatch = product.batches[0];
              const price = mainBatch?.salePrice || '0.00';

              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    {product.internalCode}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleViewDetail(product)}
                      className="text-left hover:text-primary hover:underline cursor-pointer transition-colors"
                    >
                      {product.commercialName}
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.genericName}
                  </TableCell>
                  <TableCell>
                    {product.presentation} - {product.concentration}
                  </TableCell>
                  <TableCell>
                    <Badge
                      style={{ backgroundColor: product.category.color }}
                      className="text-white"
                    >
                      {product.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{product.totalStock}</span>
                      {getStockStatus(product)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(price)}
                  </TableCell>
                  <TableCell>
                    {product.isActive ? (
                      <Badge className="bg-green-500">Activo</Badge>
                    ) : (
                      <Badge variant="destructive">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetail(product)}
                      title="Ver detalle"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(product.id)}
                      title="Editar producto"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <ProductDetailModal
        product={selectedProduct}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onBatchAdded={onRefresh}
      />
    </div>
  );
}
