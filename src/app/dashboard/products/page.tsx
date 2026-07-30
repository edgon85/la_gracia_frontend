import { getProductsAction } from '@/actions/product.actions';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';
import { ProductsPage } from '@/components/products/ProductsPage';

export default async function ProductPage() {
  // Verificar permisos: solo usuarios con acceso a 'products' pueden ver
  await getValidatedUserWithPermission('products', 'view');
  // Fetch initial data from server
  const initialFilters = {
    page: 1,
    limit: 10,
    sortBy: 'commercialName',
  };

  const response = await getProductsAction(initialFilters);

  // Handle error case
  if ('error' in response) {
    console.error('Error fetching initial products:', response.error);

    // Pass empty data in case of error
    return (
      <ProductsPage
        initialData={{
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        }}
      />
    );
  }

  // Pass initial data to client component
  return <ProductsPage initialData={response} />;
}
/* 
Sí. PATCH /products/batches/:batchId permite editar un lote existente.

Body (UpdateBatchDto, todos los campos opcionales, PartialType de AddBatchDto):
- batchNumber, expiryDate, manufacturingDate, quantity, purchasePrice, salePrice, notes, location (FARMACIA/BODEGA)
- más status (BatchStatus) e isActive propios de UpdateBatchDto

Lo maneja product-batch.service.ts vía productsService.updateBatch(batchId, dto, user). Ten en cuenta las notas del proyecto: status puede quedar desactualizado si no se recalcula tras cambiar expiryDate (usa calculateBatchStatus/isExpired() para verificar en vivo), y cambiar quantity aquí no genera un InventoryMovement — para eso están los endpoints de /inventory-movements/entry y /exit.

*/