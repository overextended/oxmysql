<script lang="ts">
  import { filterData } from '../../../store/resource';

  let value = '';

  $: {
    $filterData.search = value;
    $filterData.page = 0;
  }

  export let icon: ConstructorOfATypedSvelteComponent;
</script>

<div
  class="bg-dark-600 m-4 mt-0 flex items-center rounded-md border-[1px] border-transparent p-2 outline-none transition-all duration-100 focus-within:border-cyan-600"
>
  <div class="pr-2">
    <svelte:component this={icon} class="text-dark-300" />
  </div>
  <input type="text" bind:value class="w-full bg-transparent outline-none" placeholder="Search queries..." />
</div>
