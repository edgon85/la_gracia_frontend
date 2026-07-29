'use client';

import { useState } from 'react';
import { getProductsReportAction } from '@/actions/report.actions';
import { downloadBase64Pdf } from '@/lib/download-pdf';
import {
  ICategory,
  IProductsReportFilters,
  ProductLocation,
  ReportExpiryStatus,
  ReportStockStatus,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ProductsReportPageProps {
  categories: ICategory[];
}

const NONE_VALUE = 'ALL';

export function ProductsReportPage({ categories }: ProductsReportPageProps) {
  const [filters, setFilters] = useState<IProductsReportFilters>({
    includeInactive: false,
    price: false,
  });
  const [loading, setLoading] = useState(false);

  const updateFilter = <K extends keyof IProductsReportFilters>(
    key: K,
    value: IProductsReportFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const stockStatusSelectValue =
    filters.stockStatus ?? filters.expiryStatus?.[0] ?? NONE_VALUE;

  const handleStockStatusChange = (value: string) => {
    setFilters((prev) => {
      if (value === NONE_VALUE) {
        return { ...prev, stockStatus: undefined, expiryStatus: undefined };
      }
      if (value === 'expired' || value === 'near_expiry') {
        return {
          ...prev,
          stockStatus: undefined,
          expiryStatus: [value as ReportExpiryStatus],
        };
      }
      return {
        ...prev,
        stockStatus: value as ReportStockStatus,
        expiryStatus: undefined,
      };
    });
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const result = await getProductsReportAction(filters);
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
          Reporte de Productos
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Genera un PDF con el inventario de productos según los filtros
          seleccionados
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Todos los campos son opcionales. Sin filtros se incluyen todos los
            productos activos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Select
                value={filters.location ?? NONE_VALUE}
                onValueChange={(value) =>
                  updateFilter(
                    'location',
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
              <Label>Categoría</Label>
              <Select
                value={filters.categoryId ?? NONE_VALUE}
                onValueChange={(value) =>
                  updateFilter(
                    'categoryId',
                    value === NONE_VALUE ? undefined : value,
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>
                    Todas las categorías
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado de stock</Label>
              <Select
                value={stockStatusSelectValue}
                onValueChange={handleStockStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>Todos</SelectItem>
                  <SelectItem value="ok">OK</SelectItem>
                  <SelectItem value="low">Bajo mínimo</SelectItem>
                  <SelectItem value="out">Sin stock</SelectItem>
                  <SelectItem value="expired">Vencido</SelectItem>
                  <SelectItem value="near_expiry">Próximo a vencer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="includeInactive"
                checked={filters.includeInactive}
                onCheckedChange={(checked) =>
                  updateFilter('includeInactive', checked === true)
                }
              />
              <Label htmlFor="includeInactive">
                Incluir productos inactivos
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="price"
                checked={filters.price}
                onCheckedChange={(checked) =>
                  updateFilter('price', checked === true)
                }
              />
              <Label htmlFor="price">
                Mostrar columnas de precio (compra/venta)
              </Label>
            </div>
          </div>

          {filters.price && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="space-y-2">
                <Label>Precio de compra mínimo</Label>
                <Input
                  type="number"
                  min={0}
                  value={filters.minPurchasePrice ?? ''}
                  onChange={(e) =>
                    updateFilter(
                      'minPurchasePrice',
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Precio de compra máximo</Label>
                <Input
                  type="number"
                  min={0}
                  value={filters.maxPurchasePrice ?? ''}
                  onChange={(e) =>
                    updateFilter(
                      'maxPurchasePrice',
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Precio de venta mínimo</Label>
                <Input
                  type="number"
                  min={0}
                  value={filters.minSalePrice ?? ''}
                  onChange={(e) =>
                    updateFilter(
                      'minSalePrice',
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Precio de venta máximo</Label>
                <Input
                  type="number"
                  min={0}
                  value={filters.maxSalePrice ?? ''}
                  onChange={(e) =>
                    updateFilter(
                      'maxSalePrice',
                      e.target.value === ''
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
              </div>
            </div>
          )}

          <Button onClick={handleDownload} disabled={loading}>
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