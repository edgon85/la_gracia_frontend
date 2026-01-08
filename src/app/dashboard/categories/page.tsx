import { getCategoriesAction } from '@/actions/category.actions';
import { getValidatedUserWithPermission } from '@/actions/auth.actions';
import { CategoriesPage } from '@/components/categories/CategoriesPage';

export default async function CategoryPage() {
  // Verificar permisos: solo usuarios con acceso a 'categories' pueden ver
  await getValidatedUserWithPermission('categories', 'view');
  // Fetch initial data from server
  const initialFilters = {
    page: 1,
    limit: 10,
    sortBy: 'name',
  };

  const response = await getCategoriesAction(initialFilters);

  // Handle error case
  if ('error' in response) {
    console.error('Error fetching initial categories:', response.error);

    // Pass empty data in case of error
    return (
      <CategoriesPage
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
  return <CategoriesPage initialData={response} />;
}
