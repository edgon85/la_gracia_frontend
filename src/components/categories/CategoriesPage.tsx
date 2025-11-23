'use client';

import { useEffect, useState } from 'react';
import { getCategoriesAction } from '@/actions/category.actions';
import { ICategory, ICategoryFilters, ICategoriesResponse } from '@/lib';
import { CategoriesTable } from '@/components/categories/CategoriesTable';
import { CategoryFilters } from '@/components/categories/CategoryFilters';
import { Pagination } from '@/components/products/Pagination';
import { CreateCategoryButton } from '@/components/categories/CreateCategoryButton';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CategoriesPageProps {
  initialData: ICategoriesResponse;
}

export function CategoriesPage({ initialData }: CategoriesPageProps) {
  const [categories, setCategories] = useState<ICategory[]>(initialData.data);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialData.meta.page);
  const [itemsPerPage, setItemsPerPage] = useState(initialData.meta.limit);
  const [totalPages, setTotalPages] = useState(initialData.meta.totalPages);
  const [totalItems, setTotalItems] = useState(initialData.meta.total);
  const [sortField, setSortField] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<
    Omit<ICategoryFilters, 'page' | 'limit' | 'sortBy'>
  >({});

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoryFilters: ICategoryFilters = {
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortField,
      };

      const response = await getCategoriesAction(categoryFilters);

      if ('error' in response) {
        toast.error(response.error);
        setCategories([]);
        setTotalPages(1);
        setTotalItems(0);
      } else {
        setCategories(response.data);
        setTotalPages(response.meta.totalPages);
        setTotalItems(response.meta.total);
      }
    } catch (error) {
      toast.error('Error al cargar las categorías');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      currentPage !== initialData.meta.page ||
      itemsPerPage !== initialData.meta.limit ||
      Object.keys(filters).length > 0
    ) {
      fetchCategories();
    }
  }, [currentPage, itemsPerPage, sortField, sortOrder, filters]);

  const handleFilterChange = (
    newFilters: Omit<ICategoryFilters, 'page' | 'limit' | 'sortBy'>
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
          <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground">
            Administra las categorías de productos del hospital
          </p>
        </div>
        <CreateCategoryButton />
      </div>

      {/* Filters */}
      <CategoryFilters
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
            <CategoriesTable
              categories={categories}
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
