<script lang="ts">
  import { Route, router } from 'tinro';
  import Resource from './pages/resource/Resource.svelte';
  import Root from './pages/root/Root.svelte';

  router.mode.hash();
</script>

<main class="w-full h-full flex justify-center items-center font-main">
  <div class="bg-slate-900 text-white w-[1000px] h-[600px] flex rounded-md">
    <!-- <Navbar /> -->
    <Route path="/">
      <Root />
    </Route>
    <Route path="/:resource">
      <Resource />
    </Route>
  </div>
</main>
