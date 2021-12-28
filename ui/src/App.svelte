<script lang="ts">
  import VisibilityProvider from './providers/VisibilityProvider.svelte';
  import Main from './components/Main.svelte';
  import { debugData } from './utils/debugData';
  import { useNuiEvent } from './utils/useNuiEvent';
  import { resources } from './store/stores';
  import type { InitData } from './types/init';

  debugData([
    {
      action: 'setVisible',
      data: true,
    },
  ]);

  debugData([
    {
      action: 'init',
      data: {
        resources: ['ox_inventory', 'luke_garages', 'npwd'],
        totalQueries: 350,
        totalTime: 75000,
      },
    },
  ]);

  useNuiEvent<InitData>('init', (data) => {
    resources.set(data.resources);
  });
</script>

<main>
  <VisibilityProvider>
    <Main />
  </VisibilityProvider>
</main>
