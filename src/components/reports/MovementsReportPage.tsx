'use client';

import { useState } from 'react';
import { getMovementsReportAction } from '@/actions/report.actions';
import { downloadBase64Pdf } from '@/lib/download-pdf';
import {
  IMovementsReportFilters,
  MovementsDateMode,
  ProductLocation,
} from '@/lib';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const NONE_VALUE = 'ALL';

const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

const DATE_MODE_OPTIONS: { value: MovementsDateMode; label: string }[] = [
  { value: 'day', label: 'Por día' },
  { value: 'month', label: 'Por mes' },
  { value: 'range', label: 'Personalizado' },
];

export function MovementsReportPage() {
  const [dateMode, setDateMode] = useState<MovementsDateMode>('day');
  const [date, setDate] = useState('');
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [year, setYear] = useState<number | undefined>(CURRENT_YEAR);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState<ProductLocation | undefined>(
    undefined,
  );
  const [category, setCategory] = useState<'ENTRY' | 'EXIT' | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(false);

  const isReady =
    (dateMode === 'day' && !!date) ||
    (dateMode === 'month' && !!month && !!year) ||
    (dateMode === 'range' && !!startDate && !!endDate);

  const handleDownload = async () => {
    if (!isReady) return;

    const filters: IMovementsReportFilters = { location, category };
    if (dateMode === 'day') filters.date = date;
    if (dateMode === 'month') {
      filters.month = month;
      filters.year = year;
    }
    if (dateMode === 'range') {
      filters.startDate = startDate;
      filters.endDate = endDate;
    }

    setLoading(true);
    try {
      const result = await getMovementsReportAction(filters);
      if ('error' in result) {
        toast.error(result.error);
        return;
      }
      downloadBase64Pdf(result.data, result.filename);
      toast.success('Reporte descargado correctamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Reporte de Movimientos
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Genera un PDF con los movimientos de inventario del período
          seleccionado
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Selecciona un rango de fechas y filtros opcionales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Rango de fechas</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DATE_MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDateMode(option.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                    dateMode === option.value
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {dateMode === 'day' && (
            <div className="space-y-2 max-w-xs">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          )}

          {dateMode === 'month' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
              <div className="space-y-2">
                <Label>Mes</Label>
                <Select
                  value={month?.toString() ?? ''}
                  onValueChange={(value) => setMonth(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={m.value.toString()}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Año</Label>
                <Select
                  value={year?.toString() ?? ''}
                  onValueChange={(value) => setYear(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un año" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {dateMode === 'range' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
              <div className="space-y-2">
                <Label>Desde</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Hasta</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-800 pt-4">
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Select
                value={location ?? NONE_VALUE}
                onValueChange={(value) =>
                  setLocation(
                    value === NONE_VALUE
                      ? undefined
                      : (value as ProductLocation),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>Todas</SelectItem>
                  <SelectItem value={ProductLocation.FARMACIA}>
                    Farmacia
                  </SelectItem>
                  <SelectItem value={ProductLocation.BODEGA}>Bodega</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de movimiento</Label>
              <Select
                value={category ?? NONE_VALUE}
                onValueChange={(value) =>
                  setCategory(
                    value === NONE_VALUE
                      ? undefined
                      : (value as 'ENTRY' | 'EXIT'),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>Todos</SelectItem>
                  <SelectItem value="ENTRY">Entradas</SelectItem>
                  <SelectItem value="EXIT">Salidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleDownload} disabled={loading || !isReady}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Generando...' : 'Descargar PDF'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
