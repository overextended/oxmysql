<script lang="ts">
  import { Route, router } from 'tinro';
  import Resource from './pages/resource/Resource.svelte';
  import Root from './pages/root/Root.svelte';
  import { useNuiEvent } from './utils/useNuiEvent';
  import { resources, generalData, chartData } from './store';
  import { debugData } from './utils/debugData';
  import { visible } from './store';
  import { scale } from 'svelte/transition';
  import { fetchNui } from './utils/fetchNui';

  interface OpenData {
    resources: string[];
    totalQueries: number;
    slowQueries: number;
    totalTime: number;
    chartData: {
      labels: string[];
      data: { queries: number; time: number }[];
    };
  }

  router.mode.hash();
  router.goto('/');

  useNuiEvent('openUI', (data: OpenData) => {
    $visible = true;
    $resources = data.resources;
    $generalData = {
      queries: data.totalQueries,
      slowQueries: data.slowQueries,
      timeQuerying: data.totalTime,
    };
    $chartData = {
      labels: data.chartData.labels,
      data: data.chartData.data,
    };
  });

  debugData<OpenData>([
    {
      action: 'openUI',
      data: {
        resources: ['ox_core', 'oxmysql', 'ox_inventory', 'ox_doorlock', 'ox_lib', 'ox_vehicleshop', 'ox_target'],
        slowQueries: 13,
        totalQueries: 332,
        totalTime: 230123,
        chartData: {
          labels: ['oxmysql', 'ox_core', 'ox_inventory', 'ox_doorlock'],
          data: [
            { queries: 25, time: 133 },
            { queries: 5, time: 12 },
            { queries: 3, time: 2 },
            { queries: 72, time: 133 },
          ],
        },
      },
    },
  ]);

  const handleESC = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;

    $visible = false;
    fetchNui('exit');
  };

  $: $visible ? window.addEventListener('keydown', handleESC) : window.removeEventListener('keydown', handleESC);
</script>

{#if $visible}
  <main
    transition:scale={{ start: 0.95, duration: 150 }}
    class="font-main flex h-full w-full items-center justify-center"
  >
    <div class="bg-dark-800 flex h-[700px] w-[1200px] rounded-md text-white">
      <Route path="/">
        <Root />
      </Route>
      <Route path="/:resource">
        <Resource />
      </Route>
    </div>
  </main>
{/if}
