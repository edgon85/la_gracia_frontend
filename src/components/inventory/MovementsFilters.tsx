'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Calendar, Filter, X } from 'lucide-react';
import {
  MovementType,
  MovementCategory,
  MovementTypeLabels,
  MovementCategoryLabels,
} from '@/lib';

interface MovementsFiltersProps {
  onFilterChange: (filters: {
    type?: MovementType;
    category?: MovementCategory;
    location?: 'FARMACIA' | 'BODEGA';
    startDate?: string;
    endDate?: string;
  }) => void;
  onReset: () => void;
}

export function MovementsFilters({ onFilterChange, onReset }: MovementsFiltersProps) {
  const [type, setType] = useState<MovementType | ''>('');
  const [category, setCategory] = useState<MovementCategory | ''>('');
  const [location, setLocation] = useState<'FARMACIA' | 'BODEGA' | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  const handleApplyFilters = () => {
    onFilterChange({
      type: type || undefined,
      category: category || undefined,
      location: location || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleReset = () => {
    setType('');
    setCategory('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    onReset();
  };

  const handleCategoryChange = (value: string) => {
    const newCategory = value as MovementCategory | '';
    setCategory(newCategory);
    onFilterChange({
      type: type || undefined,
      category: newCategory || undefined,
      location: location || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleTypeChange = (value: string) => {
    const newType = value as MovementType | '';
    setType(newType);
    onFilterChange({
      type: newType || undefined,
      category: category || undefined,
      location: location || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleLocationChange = (value: string) => {
    const newLocation = value as 'FARMACIA' | 'BODEGA' | '';
    setLocation(newLocation);
    onFilterChange({
      type: type || undefined,
      category: category || undefined,
      location: newLocation || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const hasActiveFilters = type || category || location || startDate || endDate;

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={handleReset} className="gap-2">
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="border-t pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">Todas</option>
                {Object.entries(MovementCategoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="">Todos</option>
                {Object.entries(MovementTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <select
                id="location"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="FARMACIA">Farmacia</option>
                <option value="BODEGA">Bodega</option>
              </select>
            </div>

            {/* Fecha inicio */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Desde</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Fecha fin */}
            <div className="space-y-2">
              <Label htmlFor="endDate">Hasta</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleApplyFilters}>Aplicar fechas</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
