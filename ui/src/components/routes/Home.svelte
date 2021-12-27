<script lang="ts">
  import { useNuiEvent } from '../../utils/useNuiEvent';
  import { debugData } from '../../utils/debugData';

  debugData([
    {
      action: 'init',
      data: {
        resources: ['ox_inventory', 'luke_garages', 'npwd'],
        totalQueries: 350,
        totalTime: 75000,
      },
    },
  ]);

  interface QueryData {
    date: number;
    query: string;
    executionTime: number;
  }

  type QueryLog = Record<string, QueryData[]>;

  let initData: QueryLog;

  useNuiEvent('init', (data: QueryLog) => {
    initData = data;
  });
</script>

<div>
  {#if initData}
    <div>Resources: {initData.resources}</div>
    <div>Total queries: {initData.totalQueries}</div>
    <div>Total time: {initData.totalTime}</div>
  {/if}
</div>
