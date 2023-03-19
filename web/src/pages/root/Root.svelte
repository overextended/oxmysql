<script lang="ts">
  import Input from '../../components/Input.svelte';
  import { IconSearch } from '@tabler/icons-svelte';
  import { router } from 'tinro';

  const resources = ['ox_core', 'oxmysql', 'ox_inventory', 'ox_doorlock', 'ox_lib', 'ox_vehicleshop', 'ox_target'];
</script>

<div class="p-4 w-full h-full flex justify-between gap-4">
  <div class="bg-dark-700 p-4 flex flex-col w-2/3 rounded-md">
    <p class="text-2xl mb-4">Resources</p>
    <Input icon={IconSearch} />
    <div class="flex flex-col gap-3 mt-6">
      {#each resources as resource}
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
