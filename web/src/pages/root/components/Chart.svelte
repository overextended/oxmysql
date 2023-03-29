<script lang="ts">
  import { Pie } from 'svelte-chartjs';
  import { Chart as ChartJS, Title, Tooltip, ArcElement, CategoryScale, Colors, type TooltipItem } from 'chart.js';
  import { chartData } from '../../../store';

  ChartJS.register(Title, Tooltip, ArcElement, CategoryScale, Colors);
</script>

<Pie
  data={{
    labels: $chartData.labels,
    datasets: [
      {
        // @ts-ignore
        data: $chartData.data,
      },
    ],
  }}
  options={{
    parsing: {
      key: 'time',
    },
    animation: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            // @ts-ignore
            return `Queries: ${context.raw.queries}, Time: ${context.raw.time} ms`;
          },
        },
      },
    },
  }}
/>
