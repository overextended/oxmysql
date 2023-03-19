<script lang="ts">
  import Input from '../../components/Input.svelte';
  import { IconSearch } from '@tabler/icons-svelte';
  import { router } from 'tinro';
  import { search, filteredResources } from '../../store';
</script>

<div class="p-4 w-full h-full flex justify-between gap-4">
  <div class="bg-dark-700 p-4 pr-0 flex flex-col w-2/3 rounded-md">
    <div class="pr-4">
      <p class="text-2xl mb-4">Resources</p>
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
    <p class="text-2xl mb-4">General data</p>
    <div class="flex flex-col text-dark-50">
      <p>Queries: 360</p>
      <p>Time querying: 332 ms</p>
      <p>Slow queries: 6</p>
    </div>
  </div>
</div>
