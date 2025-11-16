import { getProductsAction } from '@/actions/product.actions';
import { ProductsPage } from '@/components/products/ProductsPage';

export default async function ProductPage() {
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
