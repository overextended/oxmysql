<script lang="ts">
  export let icon: ConstructorOfATypedSvelteComponent;
</script>

<div
  class="p-2 flex items-center outline-none focus-within:outline-1 focus-within:outline-cyan-600 rounded-md bg-slate-600"
>
  <div class="pr-2">
    <svelte:component this={icon} />
  </div>
  <input type="text" class="bg-transparent outline-none w-full" />
</div>
