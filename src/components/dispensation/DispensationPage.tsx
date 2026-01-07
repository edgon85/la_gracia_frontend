'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductSearch } from './ProductSearch';
import { DispensationCart } from './DispensationCart';
import { FlaskConical } from 'lucide-react';

export function DispensationPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <FlaskConical className="h-8 w-8" />
          Dispensación de Productos
        </h1>
        <p className="text-muted-foreground">
          Busca productos y registra la salida del inventario
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Búsqueda de productos */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSearch />
              <p className="text-sm text-muted-foreground mt-3">
                Escribe el nombre, código o nombre genérico del producto.
                Haz clic en un producto para agregarlo al carrito.
              </p>
            </CardContent>
          </Card>

          {/* Instrucciones */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Instrucciones</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>1. Busca el producto por nombre, código o genérico</p>
              <p>2. Haz clic en el producto para agregarlo al carrito</p>
              <p>3. Ajusta las cantidades según sea necesario</p>
              <p>4. Opcionalmente agrega una referencia (receta, paciente)</p>
              <p>5. Confirma la dispensación para descontar del inventario</p>
            </CardContent>
          </Card>
        </div>

        {/* Carrito */}
        <div>
          <DispensationCart />
        </div>
      </div>
    </div>
  );
}
