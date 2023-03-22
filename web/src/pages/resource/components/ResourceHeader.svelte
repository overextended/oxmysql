<script lang="ts">
  import { IconChevronLeft } from '@tabler/icons-svelte';

  import { router } from 'tinro';
</script>

<div class="p-4 flex items-center">
  <button
    on:click={() => router.goto('/')}
    class="flex p-2 bg-dark-600 text-dark-100 hover:text-white rounded-md justify-center items-center hover:bg-dark-500 outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
  >
    <IconChevronLeft />
    Resources
  </button>
</div>
