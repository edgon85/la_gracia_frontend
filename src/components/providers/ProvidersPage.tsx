'use client';

import { useEffect, useState } from 'react';
import { getProvidersAction } from '@/actions/provider.actions';
import { IProvider, IProviderFilters, IProvidersResponse } from '@/lib';
import { ProvidersTable } from '@/components/providers/ProvidersTable';
import { ProviderFilters } from '@/components/providers/ProviderFilters';
import { Pagination } from '@/components/products/Pagination';
import { CreateProviderButton } from '@/components/providers/CreateProviderButton';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProvidersPageProps {
  initialData: IProvidersResponse;
}

export function ProvidersPage({ initialData }: ProvidersPageProps) {
  const [providers, setProviders] = useState<IProvider[]>(initialData.data);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialData.meta.page);
  const [itemsPerPage, setItemsPerPage] = useState(initialData.meta.limit);
  const [totalPages, setTotalPages] = useState(initialData.meta.totalPages);
  const [totalItems, setTotalItems] = useState(initialData.meta.total);
  const [sortField, setSortField] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<
    Omit<IProviderFilters, 'page' | 'limit' | 'sortBy'>
  >({});

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const providerFilters: IProviderFilters = {
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortField,
      };

      const response = await getProvidersAction(providerFilters);

      if ('error' in response) {
        toast.error(response.error);
        setProviders([]);
        setTotalPages(1);
        setTotalItems(0);
      } else {
        setProviders(response.data);
        setTotalPages(response.meta.totalPages);
        setTotalItems(response.meta.total);
      }
    } catch (error) {
      toast.error('Error al cargar los proveedores');
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
      fetchProviders();
    }
  }, [currentPage, itemsPerPage, sortField, sortOrder, filters]);

  const handleFilterChange = (
    newFilters: Omit<IProviderFilters, 'page' | 'limit' | 'sortBy'>
  ) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
          <p className="text-muted-foreground">
            Administra los proveedores de productos del hospital
          </p>
        </div>
        <CreateProviderButton />
      </div>

      {/* Filters */}
      <ProviderFilters
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
            <ProvidersTable
              providers={providers}
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
