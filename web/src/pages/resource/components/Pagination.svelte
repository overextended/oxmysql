<script lang="ts">
  import IconChevronLeft from '@tabler/icons-svelte/dist/svelte/icons/IconChevronLeft.svelte';
  import IconChevronRight from '@tabler/icons-svelte/dist/svelte/icons/IconChevronRight.svelte';
  import IconChevronsLeft from '@tabler/icons-svelte/dist/svelte/icons/IconChevronsLeft.svelte';
  import IconChevronsRight from '@tabler/icons-svelte/dist/svelte/icons/IconChevronsRight.svelte';
  import { onDestroy } from 'svelte';
  import { filterData } from '../../../store';

  export let maxPage: number;

  onDestroy(() => (maxPage = 0));
</script>

<div class="flex items-center justify-center gap-6 pb-5">
  <button
    disabled={$filterData.page === 0}
    on:click={() => ($filterData.page = 0)}
    class="bg-dark-600 disabled:bg-dark-300 disabled:text-dark-400 text-dark-100 hover:bg-dark-500 rounded-md border-[1px] border-transparent p-2 outline-none hover:text-white focus-visible:border-cyan-600 focus-visible:text-white active:translate-y-[3px] disabled:cursor-not-allowed"
  >
    <IconChevronsLeft />
  </button>
  <button
    disabled={$filterData.page === 0}
    on:click={() => $filterData.page--}
    class="bg-dark-600 disabled:bg-dark-300 disabled:text-dark-400 text-dark-100 hover:bg-dark-500 rounded-md border-[1px] border-transparent p-2 outline-none hover:text-white focus-visible:border-cyan-600 focus-visible:text-white active:translate-y-[3px] disabled:cursor-not-allowed"
  >
    <IconChevronLeft />
  </button>
  <p>Page {$filterData.page + 1} of {maxPage}</p>
  <button
    disabled={$filterData.page >= maxPage - 1}
    on:click={() => $filterData.page++}
    class="bg-dark-600 disabled:bg-dark-300 disabled:text-dark-400 text-dark-100 hover:bg-dark-500 rounded-md border-[1px] border-transparent p-2 outline-none hover:text-white focus-visible:border-cyan-600 focus-visible:text-white active:translate-y-[3px] disabled:cursor-not-allowed"
  >
    <IconChevronRight />
  </button>
  <button
    disabled={$filterData.page === maxPage - 1}
    on:click={() => ($filterData.page = maxPage - 1)}
    class="bg-dark-600 disabled:bg-dark-300 disabled:text-dark-400 text-dark-100 hover:bg-dark-500 rounded-md border-[1px] border-transparent p-2 outline-none hover:text-white focus-visible:border-cyan-600 focus-visible:text-white active:translate-y-[3px] disabled:cursor-not-allowed"
  >
    <IconChevronsRight />
  </button>
</div>
