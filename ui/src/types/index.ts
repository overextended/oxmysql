interface ChartData {
  x: number;
  y: number;
  z: string;
}

export type InitData = {
  resources: string[];
  totalQueries: number;
  totalTime: number;
  slowQueries: number;
  chartData: ChartData[];
};
