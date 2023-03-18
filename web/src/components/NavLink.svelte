<script lang="ts">
  import { push, location } from 'svelte-spa-router';

  export let route: string;
</script>

<button
  on:click={() => push(route)}
  class="flex flex-col hover:bg-slate-600 w-[50px] h-[50px] justify-center items-center p-3 {$location === route
    ? 'bg-slate-600'
    : 'bg-slate-700'} rounded-md"
>
  <slot />
</button>
