import LineChart from "@/components/chart/lineChart";
import { getChartData } from "./action";


export default async function DashboardPage() {
  const chartData = await getChartData();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600">Revenue Overview</p>

      <div className="max-w-3xl">
        <LineChart data={chartData} />
      </div>
    </div>
  );
}
