// components/LineChart.tsx
'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import type { ChartData } from 'chart.js';

type Props = {
  data: ChartData<"line">;
};

export default function LineChart({ data }: Props) {
  return <Line data={data} />;
}
