<script lang="ts">
  import { onMount } from 'svelte';
  import { meta } from 'tinro';

  const route = meta();
</script>

<h2>{route.params.resource}</h2>
