'use client';

import { useEffect, useState } from 'react';
import { getProductsAction } from '@/actions/product.actions';
import { IProduct, IProductFilters, IProductsResponse } from '@/lib';
import { ProductsTable } from '@/components/products/ProductsTable';
import { ProductFilters } from '@/components/products/ProductFilters';
import { Pagination } from '@/components/products/Pagination';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProductsPageProps {
  initialData: IProductsResponse;
}

export function ProductsPage({ initialData }: ProductsPageProps) {
  const [products, setProducts] = useState<IProduct[]>(initialData.data);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialData.meta.page);
  const [itemsPerPage, setItemsPerPage] = useState(initialData.meta.limit);
  const [totalPages, setTotalPages] = useState(initialData.meta.totalPages);
  const [totalItems, setTotalItems] = useState(initialData.meta.total);
  const [sortField, setSortField] = useState<string>('commercialName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<
    Omit<IProductFilters, 'page' | 'limit' | 'sortBy'>
  >({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productFilters: IProductFilters = {
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortField,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Catálogo de Productos
        </h1>
        <p className="text-muted-foreground">
          Administra y consulta el inventario de productos del hospital
        </p>
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
