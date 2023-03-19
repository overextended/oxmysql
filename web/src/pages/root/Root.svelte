<script lang="ts">
  import Input from '../../components/Input.svelte';
  import { IconFileAnalytics, IconSearch, IconSourceCode } from '@tabler/icons-svelte';
  import { router } from 'tinro';
  import { search, filteredResources, generalData } from '../../store';
</script>

<div class="p-2 w-full h-full flex justify-between gap-2">
  <div class="bg-dark-700 p-4 pr-0 flex flex-col w-2/3 rounded-md">
    <div class="pr-4 flex justify-between items-center">
      <div class="flex gap-3 items-center ">
        <p class="text-2xl">Resources</p>
        <IconSourceCode />
      </div>
      <Input icon={IconSearch} bind:value={$search} />
    </div>
    <div class="flex flex-col gap-3 mt-6 overflow-y-auto pr-4">
      {#each $filteredResources as resource}
        <button
          on:click={() => router.goto(`/${resource}`)}
          class="bg-dark-600 p-3 text-left hover:bg-dark-400 rounded-md"
        >
          {resource}
        </button>
      {/each}
    </div>
  </div>
  <div class="bg-dark-700 p-4 flex flex-col w-1/3 rounded-md">
    <div class="flex gap-3 items-center mb-4">
      <p class="text-2xl">General data</p>
      <IconFileAnalytics />
    </div>
    <div class="flex flex-col text-dark-50">
      <p>Queries: {$generalData.queries}</p>
      <p>Time querying: {$generalData.timeQuerying} ms</p>
      <p class="text-yellow-500">Slow queries: {$generalData.slowQueries}</p>
    </div>
  </div>
</div>
