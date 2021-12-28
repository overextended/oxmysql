<script lang="ts">
  import { currentResource } from '../../store/stores';
  import { fetchNui } from '../../utils/fetchNui';
  import { onMount } from 'svelte';
  import { useNuiEvent } from '../../utils/useNuiEvent';
  import { debugData } from '../../utils/debugData';
  import type { QueryData } from '../../types/query';

  export let params: { wild: string };

  let queryData: QueryData[];
  let isDataLoaded: boolean = false;

  onMount(() => currentResource.set(params.wild));

  currentResource.subscribe((resource) => {
    isDataLoaded = false;
    fetchNui('fetchResource', resource);
    debugData([
      {
        action: 'loadResource',
        data: [
          { date: Date.now(), query: 'SELECT * FROM `somewhere`', executionTime: 2 },
          { date: Date.now(), query: 'SELECT * FROM `elsewhere`', executionTime: 5 },
          { date: Date.now(), query: 'SELECT * FROM `somewhere_elsewhere`', executionTime: 3 },
          { date: Date.now(), query: 'SELECT * FROM `selsewhere`', executionTime: 7 },
        ],
      },
    ]);
  });

  useNuiEvent('loadResource', (data: QueryData[]) => {
    queryData = data;
    isDataLoaded = true;
  });
</script>

{#if isDataLoaded === true}
  {JSON.stringify(queryData)}
{/if}
