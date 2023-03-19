<script lang="ts">
  import { Route, router } from 'tinro';
  import Resource from './pages/resource/Resource.svelte';
  import Root from './pages/root/Root.svelte';
  import { useNuiEvent } from './utils/useNuiEvent';
  import { resources, generalData } from './store';
  import { debugData } from './utils/debugData';

  interface OpenData {
    resources: string[];
    totalQueries: number;
    slowQueries: number;
    totalTime: number;
    chartData: {
      x: number;
      y: number;
      z: number;
    };
  }

  router.mode.hash();
  router.goto('/');

  useNuiEvent('openUI', (data: OpenData) => {
    $resources = data.resources;
    $generalData = {
      queries: data.totalQueries,
      slowQueries: data.slowQueries,
      timeQuerying: data.totalTime,
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
          x: 2,
          y: 5,
          z: 3,
        },
      },
    },
  ]);
</script>

<main class="w-full h-full flex justify-center items-center font-main">
  <div class="bg-dark-800 text-white w-[1000px] h-[600px] flex rounded-md">
    <Route path="/">
      <Root />
    </Route>
    <Route path="/:resource">
      <Resource />
    </Route>
  </div>
</main>
