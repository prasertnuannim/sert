// app/dashboard/chart-action.ts
'use server';

export async function getChartData() {
  // Simulate DB call
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const data = [65, 59, 80, 81, 56, 75];

  return {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };
}
