'use client';

import { useEffect, useState } from 'react';
import { getProductsAction } from '@/actions/product.actions';
import { IProduct, IProductFilters, IProductsResponse } from '@/lib';
import { ProductsTable } from '@/components/products/ProductsTable';
import { ProductFilters } from '@/components/products/ProductFilters';
import { Pagination } from '@/components/products/Pagination';
import { CreateProductButton } from '@/components/products/CreateProductButton';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, FlaskConical, Warehouse } from 'lucide-react';

interface ProductsPageProps {
  initialData: IProductsResponse;
  location?: 'farmacia' | 'bodega';
  title?: string;
  description?: string;
  showCreateButton?: boolean;
}

// Convertir location a mayúsculas para el backend
const toBackendLocation = (loc: 'farmacia' | 'bodega'): 'FARMACIA' | 'BODEGA' => {
  return loc.toUpperCase() as 'FARMACIA' | 'BODEGA';
};

export function ProductsPage({
  initialData,
  location,
  title = 'Catálogo de Productos',
  description = 'Administra y consulta el inventario de productos del hospital',
  showCreateButton = true,
}: ProductsPageProps) {
  const [products, setProducts] = useState<IProduct[]>(initialData.data);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialData.meta.page);
  const [itemsPerPage, setItemsPerPage] = useState(initialData.meta.limit);
  const [totalPages, setTotalPages] = useState(initialData.meta.totalPages);
  const [totalItems, setTotalItems] = useState(initialData.meta.total);
  const [sortField, setSortField] = useState<string>('commercialName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<
    Omit<IProductFilters, 'page' | 'limit' | 'sortBy' | 'location'>
  >({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productFilters: IProductFilters = {
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortField,
        ...(location && { location: toBackendLocation(location) }),
      };

      const response = await getProductsAction(productFilters);

      if ('error' in response) {
        toast.error(response.error);
        setProducts([]);
        setTotalPages(1);
        setTotalItems(0);
      } else {
        setProducts(response.data);
        setTotalPages(response.meta.totalPages);
        setTotalItems(response.meta.total);
      }
    } catch (error) {
      toast.error('Error al cargar los productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo fetch si no es la carga inicial
    if (
      currentPage !== initialData.meta.page ||
      itemsPerPage !== initialData.meta.limit ||
      Object.keys(filters).length > 0
    ) {
      fetchProducts();
    }
  }, [currentPage, itemsPerPage, sortField, sortOrder, filters]);

  const handleFilterChange = (
    newFilters: Omit<IProductFilters, 'page' | 'limit' | 'sortBy'>
  ) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const LocationIcon = location === 'farmacia' ? FlaskConical : location === 'bodega' ? Warehouse : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            {LocationIcon && (
              <div className="p-2 bg-primary/10 rounded-lg">
                <LocationIcon className="h-7 w-7 text-primary" />
              </div>
            )}
            {title}
          </h1>
          <p className="text-muted-foreground">
            {description}
          </p>
        </div>
        {showCreateButton && <CreateProductButton />}
      </div>

      {/* Filters */}
      <ProductFilters
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <Card className="p-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ProductsTable
              products={products}
              onSort={handleSort}
              sortField={sortField}
              sortOrder={sortOrder}
              onRefresh={fetchProducts}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </Card>
    </div>
  );
}
/* {
    "data": [
        {
            "id": "51751f5e-b8cf-4301-be66-62b0c5531734",
            "name": "Equipo de Protección Personal",
            "code": "EPP",
            "description": "Guantes, mascarillas, batas, gorros",
            "color": "#10B981",
            "isActive": true,
            "createdAt": "2025-10-26T11:23:46.274Z",
            "updatedAt": "2025-10-26T11:23:46.274Z"
        },
    ],
    "meta": {
        "total": 15,
        "page": 1,
        "limit": 10,
        "totalPages": 2
    }
} */