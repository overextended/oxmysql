<script lang="ts">
  import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from '@tabler/icons-svelte';
</script>

<div class="flex justify-center items-center gap-6 pb-5">
  <button
    class="bg-dark-600 text-dark-100 hover:text-white focus-visible:text-white rounded-md hover:bg-dark-500 p-2 active:translate-y-[3px] outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
  >
    <IconChevronsLeft />
  </button>
  <button
    class="bg-dark-600 text-dark-100 hover:text-white focus-visible:text-white rounded-md hover:bg-dark-500 p-2 active:translate-y-[3px] outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
  >
    <IconChevronLeft />
  </button>
  <p>Page 1 of 13</p>
  <button
    class="bg-dark-600 text-dark-100 hover:text-white focus-visible:text-white rounded-md hover:bg-dark-500 p-2 active:translate-y-[3px] outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
  >
    <IconChevronRight />
  </button>
  <button
    class="bg-dark-600 text-dark-100 hover:text-white focus-visible:text-white rounded-md hover:bg-dark-500 p-2 active:translate-y-[3px] outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
  >
    <IconChevronsRight />
  </button>
</div>
