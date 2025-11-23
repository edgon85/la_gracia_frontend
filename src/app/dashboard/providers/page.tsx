import { getProvidersAction } from '@/actions/provider.actions';
import { ProvidersPage } from '@/components/providers/ProvidersPage';

export default async function ProviderPage() {
  // Fetch initial data from server
  const initialFilters = {
    page: 1,
    limit: 10,
    sortBy: 'name',
  };

  const response = await getProvidersAction(initialFilters);

  // Handle error case
  if ('error' in response) {
    console.error('Error fetching initial providers:', response.error);

    // Pass empty data in case of error
    return (
      <ProvidersPage
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
  return <ProvidersPage initialData={response} />;
}
