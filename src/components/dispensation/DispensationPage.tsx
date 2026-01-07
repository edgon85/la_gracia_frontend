'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductSearch } from './ProductSearch';
import { DispensationCart } from './DispensationCart';
import { useDispensationStore } from '@/stores';
import {
  FlaskConical,
  Package,
  History,
  Keyboard,
  ArrowRight,
} from 'lucide-react';

export function DispensationPage() {
  const router = useRouter();
  const { getTotalItems } = useDispensationStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FlaskConical className="h-7 w-7 text-primary" />
            </div>
            Dispensación
          </h1>
          <p className="text-muted-foreground mt-1">
            Registra la salida de productos del inventario
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/inventario/movimientos')}
          >
            <History className="h-4 w-4 mr-2" />
            Ver Historial
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {getTotalItems()}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  En carrito
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atajos</p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-xs">
                    <Keyboard className="h-3 w-3 mr-1" />
                    /
                  </Badge>
                  <span className="text-xs text-muted-foreground">Buscar</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Búsqueda de productos - 3 columnas */}
        <div className="xl:col-span-3 space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Agregar Productos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ProductSearch />
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Escribe para buscar y haz clic en un producto para agregarlo
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Guía rápida */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Guía Rápida</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">Buscar</p>
                    <p className="text-xs text-muted-foreground">
                      Nombre, código o genérico
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">Agregar</p>
                    <p className="text-xs text-muted-foreground">
                      Clic para añadir al carrito
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Dispensar</p>
                    <p className="text-xs text-muted-foreground">
                      Confirmar y descontar
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Carrito - 2 columnas */}
        <div className="xl:col-span-2">
          <div className="sticky top-4">
            <DispensationCart />
          </div>
        </div>
      </div>
    </div>
  );
}
