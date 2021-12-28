<script lang="ts">
  import { useNuiEvent } from '../../utils/useNuiEvent';
  import type { InitData } from '../../types/init';

  let initData: InitData;

  useNuiEvent<InitData>('init', (data) => {
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
