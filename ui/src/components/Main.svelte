<script lang="ts">
  import Router from 'svelte-spa-router';
  import Resources from './menu/NavMenu.svelte';
  import Home from './routes/Home.svelte';
  import ResourceData from './routes/ResourceData.svelte';

  const routes = {
    '/': Home,
    '/*': ResourceData,
  };
</script>

<div class="container">
  <Resources />
  <div class="content-wrapper">
    <div class="content-container">
      <Router {routes} />
    </div>
  </div>
</div>

<style>
  .container {
    width: 55%;
    height: 65%;
    background-color: rgb(44, 62, 80);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 0.25vh;
  }

  .content-wrapper {
    margin-left: 18vh;
    height: 100%;
    display: grid;
    place-items: center;
  }

  .content-container {
    width: 85%;
    height: 85%;
    background-color: #34495e;
    border-radius: 0.25vh;
    color: white;
    font-family: 'Inter', sans-serif;
  }
</style>
