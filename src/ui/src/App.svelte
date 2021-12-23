<script lang="ts">
  import VisibilityProvider from './providers/VisibilityProvider.svelte';
  import Main from './components/Main.svelte';
  import { debugData } from './utils/debugData';

  debugData([
    {
      action: 'setVisible',
      data: true,
    },
  ]);
</script>

<main>
  <VisibilityProvider>
    <Main />
  </VisibilityProvider>
</main>
