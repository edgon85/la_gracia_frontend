import { getProductsAction } from '@/actions/product.actions';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';
import { ProductsPage } from '@/components/products/ProductsPage';

export default async function WarehouseProductsPage() {
  await getValidatedUserWithPermission('warehouse', 'view');

  const response = await getProductsAction({ location: 'BODEGA', limit: 10 });

  // Si hay error, mostrar página vacía en lugar de redirigir
  const initialData = 'error' in response
    ? { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }
    : response;

  return (
    <ProductsPage
      initialData={initialData}
      location="bodega"
      title="Productos de Bodega"
      description="Inventario de productos disponibles en bodega"
      showCreateButton={true}
    />
  );
}
