'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Plus, Package, Loader2 } from 'lucide-react';
import { getProductsAction } from '@/actions/product.actions';
import { IProduct } from '@/lib';
import { useDispensationStore } from '@/stores';
import { useDebounce } from '@/hooks/useDebounce';

export function ProductSearch() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { addItem } = useDispensationStore();

  useEffect(() => {
    const searchProducts = async () => {
      if (debouncedSearch.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      const response = await getProductsAction({
        search: debouncedSearch,
        limit: 10,
        isActive: true,
      });

      if ('error' in response) {
        setResults([]);
      } else {
        setResults(response.data);
        setIsOpen(true);
      }
      setIsLoading(false);
    };

    searchProducts();
  }, [debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddProduct = (product: IProduct) => {
    if (product.totalStock <= 0) return;
    addItem(product, 1);
    setSearch('');
    setResults([]);
    setIsOpen(false);
  };

  const formatPrice = (price: string) => {
    return `Q${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar producto por nombre, código o genérico..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto shadow-lg">
          <div className="p-2 space-y-1">
            {results.map((product) => {
              const mainBatch = product.batches[0];
              const price = mainBatch?.salePrice || '0.00';
              const hasStock = product.totalStock > 0;

              return (
                <div
                  key={product.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    hasStock
                      ? 'hover:bg-muted cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => hasStock && handleAddProduct(product)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-muted rounded-lg p-2">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {product.commercialName}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {product.internalCode}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="truncate">{product.genericName}</span>
                        <span>•</span>
                        <span>
                          {product.presentation} {product.concentration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-medium">{formatPrice(price)}</div>
                      <div className="text-sm">
                        {hasStock ? (
                          <span className="text-green-600">
                            Stock: {product.totalStock}
                          </span>
                        ) : (
                          <span className="text-red-500">Sin stock</span>
                        )}
                      </div>
                    </div>
                    {hasStock && (
                      <Button size="icon" variant="ghost">
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {isOpen && results.length === 0 && debouncedSearch.length >= 2 && !isLoading && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 p-4 text-center text-muted-foreground">
          No se encontraron productos
        </Card>
      )}
    </div>
  );
}
