<script lang="ts">
  import { offset, flip, shift } from 'svelte-floating-ui/dom';
  import { createFloatingActions } from 'svelte-floating-ui';
  import { fade } from 'svelte/transition';
  import Portal from 'svelte-portal';

  export let content: unknown;
  export let disabled: boolean;

  const [floatingRef, floatingContent] = createFloatingActions({
    strategy: 'absolute',
    placement: 'top',
    middleware: [offset(6), flip(), shift()],
  });

  let display = false;

  let timer: NodeJS.Timer;

  const displayTooltip = () => {
    if (disabled) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      display = true;
    }, 300);
  };

  const hideTooltip = () => {
    if (disabled) return;
    clearTimeout(timer);
    display = false;
  };
</script>

<slot {floatingRef} {displayTooltip} {hideTooltip} />
{#if display && !disabled}
  <Portal target="body">
    <div
      transition:fade={{ duration: 150 }}
      use:floatingContent
      class="absolute p-2 text-sm bg-dark-50 text-dark-400 rounded-md max-w-xl font-main"
    >
      {content}
    </div>
  </Portal>
{/if}
