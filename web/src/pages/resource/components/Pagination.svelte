<script lang="ts">
  import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-svelte';

  export let page: number;
  export let maxPage: number;
</script>

<div class="flex justify-center items-center gap-6 pb-5">
  <button
    disabled={page === 0}
    on:click={() => (page = 0)}
    class="bg-dark-600 disabled:bg-dark-300 disabled:text-dark-400 disabled:cursor-not-allowed text-dark-100 hover:text-white focus-visible:text-white rounded-md hover:bg-dark-500 p-2 active:translate-y-[3px] outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
  >
    <IconChevronsLeft />
  </button>
  <button
    disabled={page === 0}
    on:click={() => page--}
    class="bg-dark-600 disabled:bg-dark-300 disabled:text-dark-400 disabled:cursor-not-allowed text-dark-100 hover:text-white focus-visible:text-white rounded-md hover:bg-dark-500 p-2 active:translate-y-[3px] outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
  >
    <IconChevronLeft />
  </button>
  <p>Page {page + 1} of {maxPage}</p>
  <button
    disabled={page >= maxPage}
    on:click={() => page++}
    class="bg-dark-600 disabled:bg-dark-300 disabled:text-dark-400 disabled:cursor-not-allowed text-dark-100 hover:text-white focus-visible:text-white rounded-md hover:bg-dark-500 p-2 active:translate-y-[3px] outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
  >
    <IconChevronRight />
  </button>
  <button
    disabled={page === maxPage}
    on:click={() => (page = maxPage)}
    class="bg-dark-600 disabled:bg-dark-300 disabled:text-dark-400 disabled:cursor-not-allowed text-dark-100 hover:text-white focus-visible:text-white rounded-md hover:bg-dark-500 p-2 active:translate-y-[3px] outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
  >
    <IconChevronsRight />
  </button>
</div>
