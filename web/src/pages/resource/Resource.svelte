<script lang="ts">
  import Pagination from './components/Pagination.svelte';
  import QueryTable from './components/QueryTable.svelte';
  import ResourceHeader from './components/ResourceHeader.svelte';
</script>

<div class="flex flex-col w-full justify-between">
  <div>
    <ResourceHeader />
    <QueryTable />
  </div>
  <Pagination />
</div>
