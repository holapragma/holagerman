import { DashboardView } from "@/components/dashboard/dashboard-view";
import { dashboardService } from "@/services/dashboard.service";

export default async function DashboardPage() {
  const data = await dashboardService.getData();

  return <DashboardView data={data} />;
}