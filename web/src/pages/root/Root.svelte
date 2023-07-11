<script lang="ts">
  import Search from './components/Search.svelte';
  import IconFileAnalytics from '@tabler/icons-svelte/dist/svelte/icons/IconFileAnalytics.svelte';
  import IconSearch from '@tabler/icons-svelte/dist/svelte/icons/IconSearch.svelte';
  import IconSourceCode from '@tabler/icons-svelte/dist/svelte/icons/IconSourceCode.svelte';
  import { router } from 'tinro';
  import { search, filteredResources, generalData } from '../../store';
  import Chart from './components/Chart.svelte';
</script>

<div class="p-2 w-full h-full flex justify-between gap-2">
  <div class="bg-dark-700 p-4 pr-0 flex flex-col w-2/3 rounded-md">
    <div class="pr-4 flex justify-between items-center">
      <div class="flex gap-3 items-center ">
        <p class="text-2xl">Resources</p>
        <IconSourceCode />
      </div>
      <Search icon={IconSearch} bind:value={$search} />
    </div>
    <div class="flex flex-col gap-3 mt-6 overflow-y-auto pr-4">
      {#each $filteredResources as resource}
        <button
          on:click={() => router.goto(`/${resource}`)}
          class="bg-dark-600 p-3 border-[1px] outline-none border-transparent focus-visible:border-cyan-600 text-left hover:bg-dark-400 rounded-md"
        >
          {resource}
        </button>
      {/each}
    </div>
  </div>
  <div class="bg-dark-700 p-4 flex flex-col justify-between w-1/3 rounded-md">
    <div class="flex flex-col">
      <div class="flex gap-3 items-center mb-4">
        <p class="text-2xl">General data</p>
        <IconFileAnalytics />
      </div>
      <div class="flex flex-col text-dark-50">
        <p>Queries: {$generalData.queries}</p>
        <p>Time querying: {$generalData.timeQuerying.toFixed(4)} ms</p>
        <p class="text-yellow-500">Slow queries: {$generalData.slowQueries}</p>
      </div>
    </div>
    <Chart />
  </div>
</div>
