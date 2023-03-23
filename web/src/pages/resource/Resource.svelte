<script lang="ts">
  import { fetchNui } from '../../utils/fetchNui';
  import Pagination from './components/Pagination.svelte';
  import QueryTable from './components/QueryTable.svelte';
  import ResourceHeader from './components/ResourceHeader.svelte';
  import { meta } from 'tinro';
  import { useNuiEvent } from '../../utils/useNuiEvent';
  import { queries, type QueryData } from '../../store';

  const route = meta();

  let page = 0;
  let maxPage = 0;

  // I miss callbacks :(
  useNuiEvent('loadResource', (data: { queries: QueryData[]; pageCount: number }) => {
    maxPage = data.pageCount;
    $queries = data.queries;
  });

  $: fetchNui('fetchResource', { resource: route.params.resource, pageIndex: page });
</script>

<div class="flex flex-col w-full justify-between">
  <div>
    <ResourceHeader />
    <QueryTable />
  </div>
  <Pagination {page} {maxPage} />
</div>
