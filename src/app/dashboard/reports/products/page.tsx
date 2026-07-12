import { getValidatedUserWithPermission } from '@/actions/auth.actions';
import { getCategoriesAction } from '@/actions/category.actions';
import { ProductsReportPage } from '@/components/reports/ProductsReportPage';

export default async function ReportsProductsPage() {
  await getValidatedUserWithPermission('reports', 'view');

  const categoriesResponse = await getCategoriesAction({ limit: 100, isActive: true });
  const categories = 'error' in categoriesResponse ? [] : categoriesResponse.data;

  return <ProductsReportPage categories={categories} />;
}
