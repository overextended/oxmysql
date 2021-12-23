<script>
  const executingResources = ['luke_garages', 'ox_inventory', 'npwd'];
</script>

<div class="container">
  {#each executingResources as resource}
    <div class="resource-wrapper">
      <div class="resource">
        {resource}
      </div>
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

  .resource-wrapper:hover {
    background-color: grey;
  }
</style>
