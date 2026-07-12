import { getValidatedUserWithPermission } from '@/actions/auth.actions';
import { MovementsReportPage } from '@/components/reports/MovementsReportPage';

export default async function ReportsMovementsPage() {
  await getValidatedUserWithPermission('reports', 'view');

  return <MovementsReportPage />;
}
