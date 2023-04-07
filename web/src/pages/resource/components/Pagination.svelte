<script lang="ts">
  import IconChevronLeft from '@tabler/icons-svelte/dist/svelte/icons/IconChevronLeft.svelte';
  import IconChevronRight from '@tabler/icons-svelte/dist/svelte/icons/IconChevronRight.svelte';
  import IconChevronsLeft from '@tabler/icons-svelte/dist/svelte/icons/IconChevronsLeft.svelte';
  import IconChevronsRight from '@tabler/icons-svelte/dist/svelte/icons/IconChevronsRight.svelte';
  import { onDestroy } from 'svelte';
  import { tablePage } from '../../../store';

  export let maxPage: number;

  onDestroy(() => (maxPage = 0));
</script>

<div class="flex justify-center items-center gap-6 pb-5">
  <button
    disabled={$tablePage === 0}
    on:click={() => ($tablePage = 0)}
    class="bg-dark-600 disabled:bg-dark-300 disabled:text-dark-400 disabled:cursor-not-allowed text-dark-100 hover:text-white focus-visible:text-white rounded-md hover:bg-dark-500 p-2 active:translate-y-[3px] outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
  >
    <IconChevronsLeft />
  </button>
  <button
    disabled={$tablePage === 0}
    on:click={() => $tablePage--}
    class="bg-dark-600 disabled:bg-dark-300 disabled:text-dark-400 disabled:cursor-not-allowed text-dark-100 hover:text-white focus-visible:text-white rounded-md hover:bg-dark-500 p-2 active:translate-y-[3px] outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
  >
    <IconChevronLeft />
  </button>
  <p>Page {$tablePage + 1} of {maxPage}</p>
  <button
    disabled={$tablePage >= maxPage - 1}
    on:click={() => $tablePage++}
    class="bg-dark-600 disabled:bg-dark-300 disabled:text-dark-400 disabled:cursor-not-allowed text-dark-100 hover:text-white focus-visible:text-white rounded-md hover:bg-dark-500 p-2 active:translate-y-[3px] outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
  >
    <IconChevronRight />
  </button>
  <button
    disabled={$tablePage === maxPage - 1}
    on:click={() => ($tablePage = maxPage - 1)}
    class="bg-dark-600 disabled:bg-dark-300 disabled:text-dark-400 disabled:cursor-not-allowed text-dark-100 hover:text-white focus-visible:text-white rounded-md hover:bg-dark-500 p-2 active:translate-y-[3px] outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
  >
    <IconChevronsRight />
  </button>
</div>
