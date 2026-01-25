'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Loader2,
  Package,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getProductsAction,
  createProductAction,
  addBatchToProductAction,
} from '@/actions/product.actions';
import { getCategoriesAction } from '@/actions/category.actions';
import { getProvidersAction } from '@/actions/provider.actions';
import { QuickAddCategoryModal } from './QuickAddCategoryModal';
import { QuickAddProviderModal } from './QuickAddProviderModal';
import {
  ProductPresentation,
  UnitOfMeasure,
  ICategory,
  IProvider,
  IProduct,
} from '@/lib';

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
  manufacturingDate: z.string().min(1, 'La fecha de ingreso'),
  quantity: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  purchasePrice: z.number().min(0, 'El precio de compra debe ser mayor o igual a 0'),
  salePrice: z.number().min(0, 'El precio de venta debe ser mayor o igual a 0'),
  notes: z.string().optional(),
});

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);

  // Estado para el modal de producto existente
  const [existingProductModal, setExistingProductModal] = useState<{
    open: boolean;
    product: IProduct | null;
    formData: CreateProductFormData | null;
  }>({
    open: false,
    product: null,
    formData: null,
  });

  const backendLocation = location.toUpperCase() as 'FARMACIA' | 'BODEGA';

  const redirectPath = location === 'farmacia'
    ? '/dashboard/pharmacy/products'
    : '/dashboard/warehouse/products';

  // Form para crear producto
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductFormData>({
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
      notes: '',
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

  // Verificar si el código ya existe
  const checkCodeExists = async (code: string): Promise<IProduct | null> => {
    try {
      const response = await getProductsAction({
        search: code,
        limit: 10,
      });

      if (!('error' in response)) {
        const exactMatch = response.data.find(
          (p) => p.internalCode.toLowerCase() === code.toLowerCase()
        );
        return exactMatch || null;
      }
      return null;
    } catch (error) {
      console.error('Error checking code:', error);
      return null;
    }
  };

  // Agregar lote a producto existente
  const addBatchToExisting = async () => {
    if (!existingProductModal.product || !existingProductModal.formData) return;

    setIsSubmitting(true);
    try {
      const data = existingProductModal.formData;
      const result = await addBatchToProductAction(existingProductModal.product.id, {
        batchNumber: data.batchNumber,
        expiryDate: data.expiryDate,
        manufacturingDate: data.manufacturingDate,
        quantity: data.quantity,
        purchasePrice: data.purchasePrice,
        salePrice: data.salePrice,
        notes: data.notes,
        location: backendLocation,
      });

      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success(`Lote agregado exitosamente a ${existingProductModal.product.commercialName}`);
        router.push(redirectPath);
      }
    } catch (error) {
      toast.error('Error al agregar lote');
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setExistingProductModal({ open: false, product: null, formData: null });
    }
  };

  // Manejar submit del formulario
  const onSubmit = async (data: CreateProductFormData) => {
    setIsCheckingCode(true);

    // Verificar si el código ya existe
    const existingProduct = await checkCodeExists(data.internalCode);
    setIsCheckingCode(false);

    if (existingProduct) {
      // Mostrar modal preguntando si quiere agregar lote
      setExistingProductModal({
        open: true,
        product: existingProduct,
        formData: data,
      });
      return;
    }

    // Crear producto nuevo
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
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Nuevo Producto</h2>
            <span className="text-sm text-muted-foreground">
              Completa la información del producto y su lote inicial para{' '}
              <Badge variant="outline" className="ml-1">
                {location === 'farmacia' ? 'Farmacia' : 'Bodega'}
              </Badge>
            </span>
          </div>

          <Separator />

          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="font-medium">Información Básica</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="internalCode">Código Interno *</Label>
                <Input
                  id="internalCode"
                  placeholder="Ej: MED-001"
                  {...register('internalCode')}
                />
                {errors.internalCode && (
                  <p className="text-sm text-destructive">
                    {errors.internalCode.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="commercialName">Nombre Comercial *</Label>
                <Input
                  id="commercialName"
                  placeholder="Paracetamol 500mg"
                  {...register('commercialName')}
                />
                {errors.commercialName && (
                  <p className="text-sm text-destructive">
                    {errors.commercialName.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="genericName">Componente Activo *</Label>
                <Input
                  id="genericName"
                  placeholder="Acetaminofén"
                  {...register('genericName')}
                />
                {errors.genericName && (
                  <p className="text-sm text-destructive">
                    {errors.genericName.message}
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
                <Label htmlFor="presentation">Presentación *</Label>
                <select
                  id="presentation"
                  {...register('presentation')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar</option>
                  {Object.entries(ProductPresentation).map(([key, value]) => (
                    <option key={key} value={value}>
                      {presentationLabels[value]}
                    </option>
                  ))}
                </select>
                {errors.presentation && (
                  <p className="text-sm text-destructive">
                    {errors.presentation.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="concentration">Concentración *</Label>
                <Input
                  id="concentration"
                  placeholder="500"
                  {...register('concentration')}
                />
                {errors.concentration && (
                  <p className="text-sm text-destructive">
                    {errors.concentration.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unitOfMeasure">Unidad de Medida *</Label>
                <select
                  id="unitOfMeasure"
                  {...register('unitOfMeasure')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar</option>
                  {Object.entries(UnitOfMeasure).map(([key, value]) => (
                    <option key={key} value={value}>
                      {unitOfMeasureLabels[value]}
                    </option>
                  ))}
                </select>
                {errors.unitOfMeasure && (
                  <p className="text-sm text-destructive">
                    {errors.unitOfMeasure.message}
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
                <Label htmlFor="minimumStock">Stock Mínimo *</Label>
                <Input
                  id="minimumStock"
                  type="number"
                  min="0"
                  {...register('minimumStock', { valueAsNumber: true })}
                />
                {errors.minimumStock && (
                  <p className="text-sm text-destructive">
                    {errors.minimumStock.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maximumStock">Stock Máximo *</Label>
                <Input
                  id="maximumStock"
                  type="number"
                  min="0"
                  {...register('maximumStock', { valueAsNumber: true })}
                />
                {errors.maximumStock && (
                  <p className="text-sm text-destructive">
                    {errors.maximumStock.message}
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
                <Label htmlFor="categoryId">Categoría *</Label>
                <div className="flex gap-2">
                  <select
                    id="categoryId"
                    {...register('categoryId')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        { cat.code } - {cat.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsAddCategoryOpen(true)}
                    title="Agregar nueva categoría"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.categoryId && (
                  <p className="text-sm text-destructive">
                    {errors.categoryId.message}
                  </p>
                )}
                {categories.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No hay categorías. Haz clic en + para crear una.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="providerId">Proveedor *</Label>
                <div className="flex gap-2">
                  <select
                    id="providerId"
                    {...register('providerId')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar</option>
                    {providers.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsAddProviderOpen(true)}
                    title="Agregar nuevo proveedor"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.providerId && (
                  <p className="text-sm text-destructive">
                    {errors.providerId.message}
                  </p>
                )}
                {providers.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No hay proveedores. Haz clic en + para crear uno.
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
                <Label htmlFor="batchNumber">Número de Lote *</Label>
                <Input
                  id="batchNumber"
                  placeholder="LOTE-2025-001"
                  {...register('batchNumber')}
                />
                {errors.batchNumber && (
                  <p className="text-sm text-destructive">
                    {errors.batchNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturingDate">Fecha Ingreso *</Label>
                <Input
                  id="manufacturingDate"
                  type="date"
                  {...register('manufacturingDate')}
                />
                {errors.manufacturingDate && (
                  <p className="text-sm text-destructive">
                    {errors.manufacturingDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Fecha Vencimiento *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  {...register('expiryDate')}
                />
                {errors.expiryDate && (
                  <p className="text-sm text-destructive">
                    {errors.expiryDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  {...register('quantity', { valueAsNumber: true })}
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Precio Compra (Q) *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('purchasePrice', { valueAsNumber: true })}
                />
                {errors.purchasePrice && (
                  <p className="text-sm text-destructive">
                    {errors.purchasePrice.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salePrice">Precio Venta (Q) *</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('salePrice', { valueAsNumber: true })}
                />
                {errors.salePrice && (
                  <p className="text-sm text-destructive">
                    {errors.salePrice.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Observaciones adicionales..."
                rows={2}
                {...register('notes')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(redirectPath)}
              disabled={isSubmitting || isCheckingCode}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isCheckingCode}>
              {(isSubmitting || isCheckingCode) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isCheckingCode ? 'Verificando código...' : 'Crear Producto'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Modal para producto existente */}
      <Dialog
        open={existingProductModal.open}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            setExistingProductModal({ open: false, product: null, formData: null });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Producto Existente
            </DialogTitle>
            <DialogDescription>
              Ya existe un producto con el código interno ingresado.
            </DialogDescription>
          </DialogHeader>

          {existingProductModal.product && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {existingProductModal.product.commercialName}
                </span>
                <Badge variant="outline">
                  {existingProductModal.product.internalCode}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {existingProductModal.product.genericName} -{' '}
                {existingProductModal.product.presentation}{' '}
                {existingProductModal.product.concentration}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Stock total:</span>{' '}
                <span className="font-medium">
                  {existingProductModal.product.totalStock}
                </span>
              </p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            ¿Deseas agregar un nuevo lote a este producto existente con la
            información del lote que ingresaste?
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() =>
                setExistingProductModal({ open: false, product: null, formData: null })
              }
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={addBatchToExisting} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Agregar Lote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modales para agregar rápido */}
      <QuickAddCategoryModal
        open={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
        onSuccess={(newCategory) => {
          setCategories((prev) => [...prev, newCategory]);
        }}
      />

      <QuickAddProviderModal
        open={isAddProviderOpen}
        onOpenChange={setIsAddProviderOpen}
        onSuccess={(newProvider) => {
          setProviders((prev) => [...prev, newProvider]);
        }}
      />
    </div>
  );
}
