<script lang="ts">
  import IconChevronLeft from '@tabler/icons-svelte/dist/svelte/icons/IconChevronLeft.svelte';

  import { meta, router } from 'tinro';
  import { resourceData } from '../../../store';

  const route = meta();
</script>

<div class="p-4 grid grid-flow-col grid-cols-3 items-center ">
  <button
    on:click={() => router.goto('/')}
    class="flex p-2 w-12 bg-dark-600 text-dark-100 hover:text-white rounded-md justify-center items-center hover:bg-dark-500 outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
  >
    <IconChevronLeft />
  </button>
  <p class="text-center text-lg">{route.params.resource}</p>
  <div class="text-end text-dark-100 flex flex-col text-xs">
    <p>Queries: {$resourceData.resourceQueriesCount}</p>
    <p>Time: {$resourceData.resourceTime.toFixed(4)} ms</p>
    <p class="text-yellow-500">Slow queries: {$resourceData.resourceSlowQueries}</p>
  </div>
</div>
