import { MobilityDashboard } from '@/features/dashboard/components/mobility-dashboard';
import { getDashboardData } from '@/services/transport/transport.service';

export const dynamic = 'force-dynamic';

export default async function DemoPage() {
  const dashboardData = await getDashboardData();

  return <MobilityDashboard initialData={dashboardData} />;
}
