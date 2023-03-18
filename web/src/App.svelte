<script lang="ts">
  import Router from 'svelte-spa-router';
  import Navbar from './components/Navbar.svelte';
  import { routes } from './routes';
</script>

<main class="w-full h-full flex justify-center items-center font-main">
  <div class="bg-slate-900 text-white w-[1200px] h-[650px] flex rounded-md">
    <Navbar />
    <Router {routes} />
  </div>
</main>
