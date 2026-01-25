'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Trash2, Plus } from 'lucide-react';
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  toggleProductStatusAction,
} from '@/actions/product.actions';
import { getCategoriesAction } from '@/actions/category.actions';
import { getProvidersAction } from '@/actions/provider.actions';
import { QuickAddCategoryModal } from './QuickAddCategoryModal';
import { QuickAddProviderModal } from './QuickAddProviderModal';
import {
  ProductPresentation,
  ProductLocation,
  UnitOfMeasure,
  ICategory,
  IProvider,
  IProduct,
  Role,
} from '@/lib';
import { useAuthStore } from '@/stores/auth.store';

// Schema de validación para crear producto
const createProductSchema = z.object({
  internalCode: z.string().min(1, 'El código interno es requerido'),
  commercialName: z.string().min(1, 'El nombre comercial es requerido'),
  genericName: z.string().min(1, 'El componente activo es requerido'),
  presentation: z.string().min(1, 'La presentación es requerida'),
  concentration: z.string().min(1, 'La concentración es requerida'),
  unitOfMeasure: z.string().min(1, 'La unidad de medida es requerida'),
  location: z.string().min(1, 'La ubicación es requerida'),
  minimumStock: z.number().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
  maximumStock: z.number().min(0, 'El stock máximo debe ser mayor o igual a 0'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  providerId: z.string().min(1, 'El proveedor es requerido'),
  // Initial Batch fields (solo para crear)
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  manufacturingDate: z.string().optional(),
  quantity: z.number().optional(),
  purchasePrice: z.number().optional(),
  salePrice: z.number().optional(),
});

// Schema para editar (sin campos de lote)
const editProductSchema = z.object({
  internalCode: z.string().min(1, 'El código interno es requerido'),
  commercialName: z.string().min(1, 'El nombre comercial es requerido'),
  genericName: z.string().min(1, 'El componente activo es requerido'),
  presentation: z.string().min(1, 'La presentación es requerida'),
  concentration: z.string().min(1, 'La concentración es requerida'),
  unitOfMeasure: z.string().min(1, 'La unidad de medida es requerida'),
  location: z.string().min(1, 'La ubicación es requerida'),
  minimumStock: z.number().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
  maximumStock: z.number().min(0, 'El stock máximo debe ser mayor o igual a 0'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  providerId: z.string().min(1, 'El proveedor es requerido'),
});

type CreateProductFormData = z.infer<typeof createProductSchema>;
type EditProductFormData = z.infer<typeof editProductSchema>;
type ProductFormData = CreateProductFormData | EditProductFormData;

// Labels para los enums
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

const locationLabels: Record<ProductLocation, string> = {
  [ProductLocation.FARMACIA]: 'Farmacia',
  [ProductLocation.BODEGA]: 'Bodega',
  [ProductLocation.AMBOS]: 'Ambos',
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

interface ProductFormProps {
  product?: IProduct;
  isEditing?: boolean;
  defaultLocation?: 'farmacia' | 'bodega';
}

export function ProductForm({
  product,
  isEditing = false,
  defaultLocation = 'bodega',
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);
  const { user } = useAuthStore();

  // Determine redirect path based on location
  const getRedirectPath = (location?: string) => {
    const loc = location?.toUpperCase() || defaultLocation.toUpperCase();
    return loc === 'FARMACIA'
      ? '/dashboard/pharmacy/products'
      : '/dashboard/warehouse/products';
  };

  const isAdmin = user?.roles?.includes(Role.ADMIN);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(isEditing ? editProductSchema : createProductSchema),
    defaultValues:
      isEditing && product
        ? {
            internalCode: product.internalCode,
            commercialName: product.commercialName,
            genericName: product.genericName,
            presentation: product.presentation,
            concentration: product.concentration,
            unitOfMeasure: product.unitOfMeasure,
            location: product.location,
            minimumStock: product.minimumStock,
            maximumStock: product.maximumStock,
            categoryId: product.categoryId,
            providerId: product.providerId,
          }
        : {
            minimumStock: 100,
            maximumStock: 1000,
            quantity: 1,
            purchasePrice: 0,
            salePrice: 0,
            location: defaultLocation.toUpperCase(),
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
          // Si estamos editando, incluir la categoría actual aunque esté inactiva
          if (
            isEditing &&
            product?.category &&
            !categoriesResponse.data.find((c) => c.id === product.categoryId)
          ) {
            setCategories([product.category, ...categoriesResponse.data]);
          } else {
            setCategories(categoriesResponse.data);
          }
        }
        if (!('error' in providersResponse)) {
          // Si estamos editando, incluir el proveedor actual aunque esté inactivo
          if (
            isEditing &&
            product?.provider &&
            !providersResponse.data.find((p) => p.id === product.providerId)
          ) {
            setProviders([product.provider, ...providersResponse.data]);
          } else {
            setProviders(providersResponse.data);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error al cargar categorías y proveedores');
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [isEditing, product]);

  const handleToggleStatus = async () => {
    if (!product) return;

    setIsTogglingStatus(true);
    try {
      const response = await toggleProductStatusAction(product.id);

      if ('error' in response) {
        toast.error(response.error);
      } else {
        setIsActive(response.product.isActive);
        toast.success(
          response.product.isActive
            ? 'Producto activado exitosamente'
            : 'Producto desactivado exitosamente',
        );
      }
    } catch (error) {
      toast.error('Error al cambiar el estado del producto');
      console.error(error);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    setIsDeleting(true);
    try {
      const response = await deleteProductAction(product.id);

      if ('error' in response) {
        toast.error(response.error);
      } else {
        toast.success('Producto eliminado exitosamente');
        router.push(getRedirectPath(product?.location));
      }
    } catch (error) {
      toast.error('Error al eliminar el producto');
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing && product) {
        const response = await updateProductAction(product.id, {
          internalCode: data.internalCode,
          commercialName: data.commercialName,
          genericName: data.genericName,
          presentation: data.presentation,
          concentration: data.concentration,
          unitOfMeasure: data.unitOfMeasure,
          location: data.location,
          minimumStock: data.minimumStock,
          maximumStock: data.maximumStock,
          categoryId: data.categoryId,
          providerId: data.providerId,
        });

        if ('error' in response) {
          toast.error(response.error);
        } else {
          toast.success('Producto actualizado exitosamente');
          router.push(getRedirectPath(data.location));
        }
      } else {
        const createData = data as CreateProductFormData;
        const response = await createProductAction({
          internalCode: createData.internalCode,
          commercialName: createData.commercialName,
          genericName: createData.genericName,
          presentation: createData.presentation,
          concentration: createData.concentration,
          unitOfMeasure: createData.unitOfMeasure,
          location: createData.location,
          minimumStock: createData.minimumStock,
          maximumStock: createData.maximumStock,
          categoryId: createData.categoryId,
          providerId: createData.providerId,
          initialBatch: {
            batchNumber: createData.batchNumber || '',
            expiryDate: createData.expiryDate || '',
            manufacturingDate: createData.manufacturingDate || '',
            quantity: createData.quantity || 0,
            purchasePrice: createData.purchasePrice || 0,
            salePrice: createData.salePrice || 0,
          },
        });

        if ('error' in response) {
          toast.error(response.error);
        } else {
          toast.success('Producto creado exitosamente');
          router.push(getRedirectPath(createData.location));
        }
      }
    } catch (error) {
      toast.error(
        isEditing
          ? 'Error al actualizar el producto'
          : 'Error al crear el producto',
      );
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Código de barras (solo lectura en edición) */}
      {isEditing && product && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Código de Barras</h2>
          <div className="flex items-center gap-4">
            <div className="rounded-md bg-muted px-4 py-2 font-mono text-lg">
              {product.barcode}
            </div>
            <span className="text-sm text-muted-foreground">
              El código de barras se genera automáticamente y no puede ser
              modificado
            </span>
          </div>
        </div>
      )}

      {/* Información Básica */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Información Básica</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="internalCode">
              Código Interno <span className="text-destructive">*</span>
            </Label>
            <Input
              id="internalCode"
              {...register('internalCode')}
              placeholder="MED-001"
            />
            {errors.internalCode && (
              <p className="text-sm text-destructive">
                {errors.internalCode.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="commercialName">
              Nombre Comercial <span className="text-destructive">*</span>
            </Label>
            <Input
              id="commercialName"
              {...register('commercialName')}
              placeholder="Paracetamol 500mg"
            />
            {errors.commercialName && (
              <p className="text-sm text-destructive">
                {errors.commercialName.message}
              </p>
            )}
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="genericName">
              Componente Activo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="genericName"
              {...register('genericName')}
              placeholder="Acetaminofén"
            />
            {errors.genericName && (
              <p className="text-sm text-destructive">
                {errors.genericName.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Presentación y Medidas */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Presentación y Medidas</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="presentation">
              Presentación <span className="text-destructive">*</span>
            </Label>
            <select
              id="presentation"
              {...register('presentation')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Seleccionar presentación</option>
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
            <Label htmlFor="concentration">
              Concentración <span className="text-destructive">*</span>
            </Label>
            <Input
              id="concentration"
              {...register('concentration')}
              placeholder="500"
            />
            {errors.concentration && (
              <p className="text-sm text-destructive">
                {errors.concentration.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitOfMeasure">
              Unidad de Medida <span className="text-destructive">*</span>
            </Label>
            <select
              id="unitOfMeasure"
              {...register('unitOfMeasure')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Seleccionar unidad</option>
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

      {/* Inventario y Ubicación */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Inventario y Ubicación</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="location">
              Ubicación <span className="text-destructive">*</span>
            </Label>
            <select
              id="location"
              {...register('location')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Seleccionar ubicación</option>
              {Object.entries(ProductLocation).map(([key, value]) => (
                <option key={key} value={value}>
                  {locationLabels[value]}
                </option>
              ))}
            </select>
            {errors.location && (
              <p className="text-sm text-destructive">
                {errors.location.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumStock">
              Stock Mínimo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="minimumStock"
              type="number"
              {...register('minimumStock', { valueAsNumber: true })}
              placeholder="100"
              min="0"
            />
            {errors.minimumStock && (
              <p className="text-sm text-destructive">
                {errors.minimumStock.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maximumStock">
              Stock Máximo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="maximumStock"
              type="number"
              {...register('maximumStock', { valueAsNumber: true })}
              placeholder="1000"
              min="0"
            />
            {errors.maximumStock && (
              <p className="text-sm text-destructive">
                {errors.maximumStock.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Categoría y Proveedor */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Categoría y Proveedor</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="categoryId">
              Categoría <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <select
                id="categoryId"
                {...register('categoryId')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.code} - {category.name}
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
                No hay categorías activas. Haz clic en + para crear una.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="providerId">
              Proveedor <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <select
                id="providerId"
                {...register('providerId')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccionar proveedor</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
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
                No hay proveedores activos. Haz clic en + para crear uno.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Lote Inicial - Solo para crear */}
      {!isEditing && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Lote Inicial</h2>
          <p className="text-sm text-muted-foreground">
            Ingrese la información del primer lote del producto
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="batchNumber">
                Número de Lote <span className="text-destructive">*</span>
              </Label>
              <Input
                id="batchNumber"
                {...register('batchNumber' as keyof ProductFormData)}
                placeholder="LOTE-2024-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturingDate">
                Fecha de Ingreso <span className="text-destructive">*</span>
              </Label>
              <Input
                id="manufacturingDate"
                type="date"
                {...register('manufacturingDate' as keyof ProductFormData)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">
                Fecha de Vencimiento <span className="text-destructive">*</span>
              </Label>
              <Input
                id="expiryDate"
                type="date"
                {...register('expiryDate' as keyof ProductFormData)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Cantidad Inicial <span className="text-destructive">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                {...register('quantity' as keyof ProductFormData, {
                  valueAsNumber: true,
                })}
                placeholder="500"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice">
                Precio de Compra (Q) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                {...register('purchasePrice' as keyof ProductFormData, {
                  valueAsNumber: true,
                })}
                placeholder="2.50"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice">
                Precio de Venta (Q) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                {...register('salePrice' as keyof ProductFormData, {
                  valueAsNumber: true,
                })}
                placeholder="5.00"
                min="0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Estado del Producto - Solo en modo edición */}
      {isEditing && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Estado del Producto</h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className="cursor-pointer"
              onClick={!isTogglingStatus ? handleToggleStatus : undefined}
            >
              {isTogglingStatus ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cambiando...
                </span>
              ) : isActive ? (
                'Activo'
              ) : (
                'Inactivo'
              )}
            </span>
            <span className="text-sm text-muted-foreground">
              {isActive
                ? 'El producto está disponible para la venta'
                : 'El producto no aparecerá en las listas de selección'}
            </span>
          </div>
        </div>
      )}

      {/* Zona de Peligro - Solo para admins en modo edición */}
      {isEditing && isAdmin && (
        <div className="space-y-4 rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <h2 className="text-xl font-semibold text-destructive">
            Zona de Peligro
          </h2>
          <p className="text-sm text-muted-foreground">
            Esta acción eliminará permanentemente el producto y no se puede
            deshacer.
          </p>
          {showDeleteConfirm ? (
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium">
                ¿Estás seguro de eliminar este producto?
              </p>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sí, eliminar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Producto
            </Button>
          )}
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(getRedirectPath(product?.location))}
          disabled={isSubmitting || isDeleting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || isDeleting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
        </Button>
      </div>

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
    </form>
  );
}
