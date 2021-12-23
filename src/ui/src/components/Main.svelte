<script lang="ts">
  import Resources from './resources/Resources.svelte';
</script>

<div class="container">
  <Resources />
  <div class="content-wrapper">
    <div class="content-container">Some Data here</div>
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
    width: 80vh;
    height: 55vh;
    background-color: #34495e;
    border-radius: 0.25vh;
    color: white;
    font-family: 'Inter', sans-serif;
  }
</style>
