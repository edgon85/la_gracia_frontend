'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MovementsFilters } from './MovementsFilters';
import { MovementsTable } from './MovementsTable';
import { getMovementsAction } from '@/actions/inventory.actions';
import {
  IInventoryMovement,
  IMovementFilters,
  MovementType,
  MovementCategory,
} from '@/lib';
import {
  History,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface MovementsPageProps {
  initialLocation?: 'FARMACIA' | 'BODEGA';
}

export function MovementsPage({ initialLocation }: MovementsPageProps) {
  const router = useRouter();
  const [movements, setMovements] = useState<IInventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<IMovementFilters>({
    location: initialLocation,
    limit: 20,
  });

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMovementsAction({
        ...filters,
        page: currentPage,
      });

      if ('error' in response) {
        toast.error(response.error);
        return;
      }

      setMovements(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch {
      toast.error('Error al cargar los movimientos');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const handleFilterChange = (newFilters: {
    type?: MovementType;
    category?: MovementCategory;
    location?: 'FARMACIA' | 'BODEGA';
    startDate?: string;
    endDate?: string;
  }) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({
      location: initialLocation,
      limit: 20,
    });
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchMovements();
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <History className="h-7 w-7 text-primary" />
              </div>
              Historial de Movimientos
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 ml-11">
            Consulta todos los movimientos de inventario
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <MovementsFilters onFilterChange={handleFilterChange} onReset={handleReset} />

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Movimientos
              {total > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({total} registros)
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <MovementsTable movements={movements} isLoading={loading} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
