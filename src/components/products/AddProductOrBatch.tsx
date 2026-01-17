'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Search, Package, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  getProductsAction,
  createProductAction,
  addBatchToProductAction,
} from '@/actions/product.actions';
import { getCategoriesAction } from '@/actions/category.actions';
import { getProvidersAction } from '@/actions/provider.actions';
import {
  ProductPresentation,
  UnitOfMeasure,
  ICategory,
  IProvider,
  IProduct,
} from '@/lib';
import { useDebounce } from '@/hooks/useDebounce';

// Schema para buscar producto
const searchSchema = z.object({
  internalCode: z.string().min(1, 'El código interno es requerido'),
});

// Schema para agregar lote a producto existente
const addBatchSchema = z.object({
  batchNumber: z.string().min(1, 'El número de lote es requerido'),
  expiryDate: z.string().min(1, 'La fecha de vencimiento es requerida'),
  manufacturingDate: z.string().min(1, 'La fecha de fabricación es requerida'),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  purchasePrice: z.number().min(0, 'El precio de compra debe ser mayor o igual a 0'),
  salePrice: z.number().min(0, 'El precio de venta debe ser mayor o igual a 0'),
  notes: z.string().optional(),
});

// Schema para crear producto nuevo
const createProductSchema = z.object({
  internalCode: z.string().min(1, 'El código interno es requerido'),
  commercialName: z.string().min(1, 'El nombre comercial es requerido'),
  genericName: z.string().min(1, 'El componente activo es requerido'),
  presentation: z.string().min(1, 'La presentación es requerida'),
  concentration: z.string().min(1, 'La concentración es requerida'),
  unitOfMeasure: z.string().min(1, 'La unidad de medida es requerida'),
  minimumStock: z.number().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
  maximumStock: z.number().min(0, 'El stock máximo debe ser mayor o igual a 0'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  providerId: z.string().min(1, 'El proveedor es requerido'),
  // Initial batch
  batchNumber: z.string().min(1, 'El número de lote es requerido'),
  expiryDate: z.string().min(1, 'La fecha de vencimiento es requerida'),
  manufacturingDate: z.string().min(1, 'La fecha de fabricación es requerida'),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  purchasePrice: z.number().min(0, 'El precio de compra debe ser mayor o igual a 0'),
  salePrice: z.number().min(0, 'El precio de venta debe ser mayor o igual a 0'),
});

type AddBatchFormData = z.infer<typeof addBatchSchema>;
type CreateProductFormData = z.infer<typeof createProductSchema>;

// Labels
const presentationLabels: Record<ProductPresentation, string> = {
  [ProductPresentation.TABLETAS]: 'Tabletas',
  [ProductPresentation.CAPSULAS]: 'Cápsulas',
  [ProductPresentation.JARABE]: 'Jarabe',
  [ProductPresentation.SUSPENSION]: 'Suspensión',
  [ProductPresentation.SOLUCION]: 'Solución',
  [ProductPresentation.AMPOLLA]: 'Ampolla',
  [ProductPresentation.FRASCO]: 'Frasco',
  [ProductPresentation.CAJA]: 'Caja',
  [ProductPresentation.SOBRE]: 'Sobre',
  [ProductPresentation.TUBO]: 'Tubo',
  [ProductPresentation.CREMA]: 'Crema',
  [ProductPresentation.POMADA]: 'Pomada',
  [ProductPresentation.GEL]: 'Gel',
  [ProductPresentation.SPRAY]: 'Spray',
  [ProductPresentation.INHALADOR]: 'Inhalador',
  [ProductPresentation.PARCHE]: 'Parche',
  [ProductPresentation.SUPOSITORIO]: 'Supositorio',
  [ProductPresentation.OVULO]: 'Óvulo',
  [ProductPresentation.GOTAS]: 'Gotas',
  [ProductPresentation.UNIDAD]: 'Unidad',
  [ProductPresentation.ROLLO]: 'Rollo',
  [ProductPresentation.PAR]: 'Par',
  [ProductPresentation.KIT]: 'Kit',
  [ProductPresentation.OTRO]: 'Otro',
};

const unitOfMeasureLabels: Record<UnitOfMeasure, string> = {
  [UnitOfMeasure.MILIGRAMOS]: 'Miligramos (mg)',
  [UnitOfMeasure.GRAMOS]: 'Gramos (g)',
  [UnitOfMeasure.KILOGRAMOS]: 'Kilogramos (kg)',
  [UnitOfMeasure.MILILITROS]: 'Mililitros (ml)',
  [UnitOfMeasure.LITROS]: 'Litros (L)',
  [UnitOfMeasure.UNIDADES]: 'Unidades',
  [UnitOfMeasure.PIEZAS]: 'Piezas',
  [UnitOfMeasure.TABLETAS]: 'Tabletas',
  [UnitOfMeasure.CAPSULAS]: 'Cápsulas',
  [UnitOfMeasure.AMPOLLAS]: 'Ampollas',
  [UnitOfMeasure.FRASCOS]: 'Frascos',
  [UnitOfMeasure.CAJAS]: 'Cajas',
  [UnitOfMeasure.SOBRES]: 'Sobres',
  [UnitOfMeasure.METROS]: 'Metros (m)',
  [UnitOfMeasure.CENTIMETROS]: 'Centímetros (cm)',
  [UnitOfMeasure.OTRO]: 'Otro',
};

interface AddProductOrBatchProps {
  location: 'farmacia' | 'bodega';
}

export function AddProductOrBatch({ location }: AddProductOrBatchProps) {
  const router = useRouter();
  const [searchCode, setSearchCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [existingProduct, setExistingProduct] = useState<IProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const debouncedSearchCode = useDebounce(searchCode, 500);
  const backendLocation = location.toUpperCase() as 'FARMACIA' | 'BODEGA';

  const redirectPath = location === 'farmacia'
    ? '/dashboard/pharmacy/products'
    : '/dashboard/warehouse/products';

  // Form para agregar lote
  const batchForm = useForm<AddBatchFormData>({
    resolver: zodResolver(addBatchSchema),
    defaultValues: {
      batchNumber: '',
      expiryDate: '',
      manufacturingDate: '',
      quantity: 1,
      purchasePrice: 0,
      salePrice: 0,
      notes: '',
    },
  });

  // Form para crear producto
  const productForm = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      internalCode: '',
      commercialName: '',
      genericName: '',
      presentation: '',
      concentration: '',
      unitOfMeasure: '',
      minimumStock: 100,
      maximumStock: 1000,
      categoryId: '',
      providerId: '',
      batchNumber: '',
      expiryDate: '',
      manufacturingDate: '',
      quantity: 1,
      purchasePrice: 0,
      salePrice: 0,
    },
  });

  // Cargar categorías y proveedores
  useEffect(() => {
    async function loadData() {
      try {
        const [categoriesResponse, providersResponse] = await Promise.all([
          getCategoriesAction({ isActive: true, limit: 100 }),
          getProvidersAction({ isActive: true, limit: 100 }),
        ]);

        if (!('error' in categoriesResponse)) {
          setCategories(categoriesResponse.data);
        }
        if (!('error' in providersResponse)) {
          setProviders(providersResponse.data);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error al cargar categorías y proveedores');
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, []);

  // Buscar producto por código interno
  const searchProduct = useCallback(async (code: string) => {
    if (code.length < 2) {
      setExistingProduct(null);
      setSearchPerformed(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await getProductsAction({
        search: code,
        limit: 10,
      });

      if (!('error' in response)) {
        // Buscar coincidencia exacta por código interno
        const exactMatch = response.data.find(
          (p) => p.internalCode.toLowerCase() === code.toLowerCase()
        );

        if (exactMatch) {
          setExistingProduct(exactMatch);
        } else {
          setExistingProduct(null);
        }
      } else {
        setExistingProduct(null);
      }
      setSearchPerformed(true);
    } catch (error) {
      console.error('Error searching product:', error);
      setExistingProduct(null);
      setSearchPerformed(true);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Buscar cuando cambie el código
  useEffect(() => {
    if (debouncedSearchCode) {
      searchProduct(debouncedSearchCode);
      // Actualizar el código en el form de crear producto
      productForm.setValue('internalCode', debouncedSearchCode);
    } else {
      setExistingProduct(null);
      setSearchPerformed(false);
    }
  }, [debouncedSearchCode, searchProduct, productForm]);

  // Manejar agregar lote a producto existente
  const onSubmitBatch = async (data: AddBatchFormData) => {
    if (!existingProduct) return;

    setIsSubmitting(true);
    try {
      const result = await addBatchToProductAction(existingProduct.id, {
        ...data,
        location: backendLocation,
      });

      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success(`Lote agregado exitosamente a ${existingProduct.commercialName}`);
        router.push(redirectPath);
      }
    } catch (error) {
      toast.error('Error al agregar lote');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar crear producto nuevo
  const onSubmitProduct = async (data: CreateProductFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createProductAction({
        internalCode: data.internalCode,
        commercialName: data.commercialName,
        genericName: data.genericName,
        presentation: data.presentation,
        concentration: data.concentration,
        unitOfMeasure: data.unitOfMeasure,
        location: backendLocation,
        minimumStock: data.minimumStock,
        maximumStock: data.maximumStock,
        categoryId: data.categoryId,
        providerId: data.providerId,
        initialBatch: {
          batchNumber: data.batchNumber,
          expiryDate: data.expiryDate,
          manufacturingDate: data.manufacturingDate,
          quantity: data.quantity,
          purchasePrice: data.purchasePrice,
          salePrice: data.salePrice,
          location: backendLocation,
        },
      });

      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success('Producto creado exitosamente');
        router.push(redirectPath);
      }
    } catch (error) {
      toast.error('Error al crear producto');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Paso 1: Buscar producto */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Search className="h-5 w-5" />
              Paso 1: Buscar Producto
            </h2>
            <p className="text-sm text-muted-foreground">
              Ingresa el código interno para verificar si el producto ya existe
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="searchCode">Código Interno</Label>
              <div className="relative mt-1">
                <Input
                  id="searchCode"
                  placeholder="Ej: MED-001"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="pr-10"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {/* Resultado de la búsqueda */}
          {searchPerformed && searchCode.length >= 2 && (
            <div className="mt-4">
              {existingProduct ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                        Producto Existente Encontrado
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Este producto ya existe en el sistema. Solo puedes agregar un nuevo lote.
                      </p>
                      <div className="mt-3 bg-white dark:bg-gray-800 rounded-md p-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{existingProduct.commercialName}</span>
                          <Badge variant="outline">{existingProduct.internalCode}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {existingProduct.genericName} - {existingProduct.presentation} {existingProduct.concentration}
                        </p>
                        <p className="text-sm mt-1">
                          <span className="text-muted-foreground">Stock total:</span>{' '}
                          <span className="font-medium">{existingProduct.totalStock}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-800 dark:text-green-200">
                        Código Disponible
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        No existe un producto con este código. Puedes crear uno nuevo.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Paso 2: Formulario según el caso */}
      {searchPerformed && searchCode.length >= 2 && (
        <Card className="p-6">
          {existingProduct ? (
            // Formulario para agregar lote
            <form onSubmit={batchForm.handleSubmit(onSubmitBatch)} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">
                  Paso 2: Agregar Lote a {existingProduct.commercialName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Completa la información del nuevo lote para{' '}
                  <Badge variant="outline" className="ml-1">
                    {location === 'farmacia' ? 'Farmacia' : 'Bodega'}
                  </Badge>
                </p>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="batch-batchNumber">Número de Lote *</Label>
                  <Input
                    id="batch-batchNumber"
                    placeholder="LOTE-2025-001"
                    {...batchForm.register('batchNumber')}
                  />
                  {batchForm.formState.errors.batchNumber && (
                    <p className="text-sm text-destructive">
                      {batchForm.formState.errors.batchNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch-manufacturingDate">Fecha Fabricación *</Label>
                  <Input
                    id="batch-manufacturingDate"
                    type="date"
                    {...batchForm.register('manufacturingDate')}
                  />
                  {batchForm.formState.errors.manufacturingDate && (
                    <p className="text-sm text-destructive">
                      {batchForm.formState.errors.manufacturingDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch-expiryDate">Fecha Vencimiento *</Label>
                  <Input
                    id="batch-expiryDate"
                    type="date"
                    {...batchForm.register('expiryDate')}
                  />
                  {batchForm.formState.errors.expiryDate && (
                    <p className="text-sm text-destructive">
                      {batchForm.formState.errors.expiryDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch-quantity">Cantidad *</Label>
                  <Input
                    id="batch-quantity"
                    type="number"
                    min="1"
                    {...batchForm.register('quantity', { valueAsNumber: true })}
                  />
                  {batchForm.formState.errors.quantity && (
                    <p className="text-sm text-destructive">
                      {batchForm.formState.errors.quantity.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch-purchasePrice">Precio Compra (Q) *</Label>
                  <Input
                    id="batch-purchasePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...batchForm.register('purchasePrice', { valueAsNumber: true })}
                  />
                  {batchForm.formState.errors.purchasePrice && (
                    <p className="text-sm text-destructive">
                      {batchForm.formState.errors.purchasePrice.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch-salePrice">Precio Venta (Q) *</Label>
                  <Input
                    id="batch-salePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...batchForm.register('salePrice', { valueAsNumber: true })}
                  />
                  {batchForm.formState.errors.salePrice && (
                    <p className="text-sm text-destructive">
                      {batchForm.formState.errors.salePrice.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch-notes">Notas (opcional)</Label>
                <Textarea
                  id="batch-notes"
                  placeholder="Observaciones adicionales..."
                  rows={2}
                  {...batchForm.register('notes')}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(redirectPath)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Agregar Lote
                </Button>
              </div>
            </form>
          ) : (
            // Formulario para crear producto nuevo
            <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Paso 2: Crear Producto Nuevo</h2>
                <p className="text-sm text-muted-foreground">
                  Completa la información del producto y su lote inicial para{' '}
                  <Badge variant="outline" className="ml-1">
                    {location === 'farmacia' ? 'Farmacia' : 'Bodega'}
                  </Badge>
                </p>
              </div>

              <Separator />

              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="font-medium">Información Básica</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="product-internalCode">Código Interno *</Label>
                    <Input
                      id="product-internalCode"
                      {...productForm.register('internalCode')}
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-commercialName">Nombre Comercial *</Label>
                    <Input
                      id="product-commercialName"
                      placeholder="Paracetamol 500mg"
                      {...productForm.register('commercialName')}
                    />
                    {productForm.formState.errors.commercialName && (
                      <p className="text-sm text-destructive">
                        {productForm.formState.errors.commercialName.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="product-genericName">Componente Activo *</Label>
                    <Input
                      id="product-genericName"
                      placeholder="Acetaminofén"
                      {...productForm.register('genericName')}
                    />
                    {productForm.formState.errors.genericName && (
                      <p className="text-sm text-destructive">
                        {productForm.formState.errors.genericName.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Presentación */}
              <div className="space-y-4">
                <h3 className="font-medium">Presentación y Medidas</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="product-presentation">Presentación *</Label>
                    <select
                      id="product-presentation"
                      {...productForm.register('presentation')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar</option>
                      {Object.entries(ProductPresentation).map(([key, value]) => (
                        <option key={key} value={value}>
                          {presentationLabels[value]}
                        </option>
                      ))}
                    </select>
                    {productForm.formState.errors.presentation && (
                      <p className="text-sm text-destructive">
                        {productForm.formState.errors.presentation.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-concentration">Concentración *</Label>
                    <Input
                      id="product-concentration"
                      placeholder="500"
                      {...productForm.register('concentration')}
                    />
                    {productForm.formState.errors.concentration && (
                      <p className="text-sm text-destructive">
                        {productForm.formState.errors.concentration.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-unitOfMeasure">Unidad de Medida *</Label>
                    <select
                      id="product-unitOfMeasure"
                      {...productForm.register('unitOfMeasure')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar</option>
                      {Object.entries(UnitOfMeasure).map(([key, value]) => (
                        <option key={key} value={value}>
                          {unitOfMeasureLabels[value]}
                        </option>
                      ))}
                    </select>
                    {productForm.formState.errors.unitOfMeasure && (
                      <p className="text-sm text-destructive">
                        {productForm.formState.errors.unitOfMeasure.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Stock */}
              <div className="space-y-4">
                <h3 className="font-medium">Configuración de Stock</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="product-minimumStock">Stock Mínimo *</Label>
                    <Input
                      id="product-minimumStock"
                      type="number"
                      min="0"
                      {...productForm.register('minimumStock', { valueAsNumber: true })}
                    />
                    {productForm.formState.errors.minimumStock && (
                      <p className="text-sm text-destructive">
                        {productForm.formState.errors.minimumStock.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-maximumStock">Stock Máximo *</Label>
                    <Input
                      id="product-maximumStock"
                      type="number"
                      min="0"
                      {...productForm.register('maximumStock', { valueAsNumber: true })}
                    />
                    {productForm.formState.errors.maximumStock && (
                      <p className="text-sm text-destructive">
                        {productForm.formState.errors.maximumStock.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Categoría y Proveedor */}
              <div className="space-y-4">
                <h3 className="font-medium">Categoría y Proveedor</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="product-categoryId">Categoría *</Label>
                    <select
                      id="product-categoryId"
                      {...productForm.register('categoryId')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {productForm.formState.errors.categoryId && (
                      <p className="text-sm text-destructive">
                        {productForm.formState.errors.categoryId.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-providerId">Proveedor *</Label>
                    <select
                      id="product-providerId"
                      {...productForm.register('providerId')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar</option>
                      {providers.map((prov) => (
                        <option key={prov.id} value={prov.id}>
                          {prov.name}
                        </option>
                      ))}
                    </select>
                    {productForm.formState.errors.providerId && (
                      <p className="text-sm text-destructive">
                        {productForm.formState.errors.providerId.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Lote Inicial */}
              <div className="space-y-4">
                <h3 className="font-medium">Lote Inicial</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="product-batchNumber">Número de Lote *</Label>
                    <Input
                      id="product-batchNumber"
                      placeholder="LOTE-2025-001"
                      {...productForm.register('batchNumber')}
                    />
                    {productForm.formState.errors.batchNumber && (
                      <p className="text-sm text-destructive">
                        {productForm.formState.errors.batchNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-manufacturingDate">Fecha Fabricación *</Label>
                    <Input
                      id="product-manufacturingDate"
                      type="date"
                      {...productForm.register('manufacturingDate')}
                    />
                    {productForm.formState.errors.manufacturingDate && (
                      <p className="text-sm text-destructive">
                        {productForm.formState.errors.manufacturingDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-expiryDate">Fecha Vencimiento *</Label>
                    <Input
                      id="product-expiryDate"
                      type="date"
                      {...productForm.register('expiryDate')}
                    />
                    {productForm.formState.errors.expiryDate && (
                      <p className="text-sm text-destructive">
                        {productForm.formState.errors.expiryDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-quantity">Cantidad *</Label>
                    <Input
                      id="product-quantity"
                      type="number"
                      min="1"
                      {...productForm.register('quantity', { valueAsNumber: true })}
                    />
                    {productForm.formState.errors.quantity && (
                      <p className="text-sm text-destructive">
                        {productForm.formState.errors.quantity.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-purchasePrice">Precio Compra (Q) *</Label>
                    <Input
                      id="product-purchasePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      {...productForm.register('purchasePrice', { valueAsNumber: true })}
                    />
                    {productForm.formState.errors.purchasePrice && (
                      <p className="text-sm text-destructive">
                        {productForm.formState.errors.purchasePrice.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-salePrice">Precio Venta (Q) *</Label>
                    <Input
                      id="product-salePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      {...productForm.register('salePrice', { valueAsNumber: true })}
                    />
                    {productForm.formState.errors.salePrice && (
                      <p className="text-sm text-destructive">
                        {productForm.formState.errors.salePrice.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(redirectPath)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Producto
                </Button>
              </div>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}
