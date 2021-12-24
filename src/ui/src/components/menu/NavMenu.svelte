<script lang="ts">
  import { currentResource } from '../../store/stores';
  const executingResources = ['luke_garages', 'ox_inventory', 'npwd'];
</script>

<div class="container">
  <a href="#/"><div class="home-header">Home</div></a>
  {#each executingResources as resource}
    <div class="resource-wrapper">
      <a href={`#/${resource}`}>
        <div class="resource" on:click={() => currentResource.set(resource)}>
          {resource}
        </div>
      </a>
    </div>
  {/each}
</div>

<style>
  .container {
    width: 18vh;
    position: fixed;
    left: 0;
    top: 0;
    background-color: #34495e;
    height: 100%;
    border-top-left-radius: 0.25vh;
    border-bottom-left-radius: 0.25vh;
    color: white;
    font-family: 'Inter', sans-serif;
    user-select: none;
  }

  .home-header {
    font-size: 2.2vh;
    text-align: left;
    padding: 1vh;
    border-bottom: 0.25vh solid grey;
  }

  .resource-wrapper {
    padding: 1vh;
  }

  .resource {
    font-family: 'Inter', sans-serif;
    font-size: 2.2vh;
    width: 100%;
    height: 5%;
    display: block;
  }

  .resource-wrapper:hover,
  .home-header:hover {
    background-color: grey;
  }

  a:visited {
    color: white;
  }
</style>
