<script lang="ts">
  export let icon: ConstructorOfATypedSvelteComponent;
  export let value: string;
</script>

<div
  class="p-2 flex items-center outline-none border-[1px] border-transparent transition-all duration-100 focus-within:border-cyan-600 rounded-md bg-dark-600"
>
  <div class="pr-2">
    <svelte:component this={icon} class="text-dark-300" />
  </div>
  <input type="text" bind:value class="bg-transparent outline-none w-full" placeholder="Search resources..." />
</div>
