'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';

interface ProductFiltersProps {
  onFilterChange: (filters: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
  }) => void;
  onReset: () => void;
}

export function ProductFilters({ onFilterChange, onReset }: ProductFiltersProps) {
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);

  const handleApplyFilters = () => {
    const filters: any = {};

    if (search) filters.search = search;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (isActive !== undefined) filters.isActive = isActive;

    onFilterChange(filters);
  };

  const handleReset = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setIsActive(undefined);
    onReset();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    // Auto-aplicar búsqueda mientras el usuario escribe
    onFilterChange({ search: value, minPrice: minPrice ? parseFloat(minPrice) : undefined, maxPrice: maxPrice ? parseFloat(maxPrice) : undefined, isActive });
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Barra de búsqueda principal */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar productos por nombre, código o código de barras..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
        {(search || minPrice || maxPrice || isActive !== undefined) && (
          <Button variant="ghost" onClick={handleReset} className="gap-2">
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="border-t pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Filtro de precio mínimo */}
            <div className="space-y-2">
              <Label htmlFor="minPrice">Precio mínimo</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0.00"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Filtro de precio máximo */}
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Precio máximo</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="999.99"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Filtro de estado */}
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={isActive === undefined ? 'all' : isActive ? 'active' : 'inactive'}
                onChange={(e) => {
                  const value = e.target.value;
                  setIsActive(value === 'all' ? undefined : value === 'active');
                }}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              Limpiar filtros
            </Button>
            <Button onClick={handleApplyFilters}>Aplicar filtros</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
