<script lang="ts">
  import { fetchNui } from '../../utils/fetchNui';
  import Pagination from './components/Pagination.svelte';
  import QueryTable from './components/QueryTable.svelte';
  import ResourceHeader from './components/ResourceHeader.svelte';
  import { meta } from 'tinro';
  import { useNuiEvent } from '../../utils/useNuiEvent';
  import { queries, resourceData, type QueryData } from '../../store';
  import { debugData } from '../../utils/debugData';
  import { onDestroy } from 'svelte';

  const route = meta();

  let page = 0;
  let maxPage = 0;

  onDestroy(() => {
    $queries = [];
  });

  interface ResourceData {
    queries: QueryData[];
    pageCount: number;
    resourceQueriesCount: number;
    resourceSlowQueries: number;
    resourceTime: number;
  }

  debugData<{ queries: QueryData[]; pageCount: number }>([
    {
      action: 'loadResource',
      data: {
        queries: [
          { query: 'SELECT * FROM users WHERE ID = 1', executionTime: 3, slow: false, date: Date.now() },
          { query: 'SELECT * FROM users WHERE ID = 1', executionTime: 23, slow: true, date: Date.now() },
          { query: 'SELECT * FROM users WHERE ID = 1', executionTime: 15, slow: false, date: Date.now() },
          { query: 'SELECT * FROM users WHERE ID = 1', executionTime: 122, slow: true, date: Date.now() },
          { query: 'SELECT * FROM users WHERE ID = 1', executionTime: 17, slow: false, date: Date.now() },
        ],
        pageCount: 3,
      },
    },
  ]);

  // I miss callbacks :(
  useNuiEvent('loadResource', (data: ResourceData) => {
    maxPage = data.pageCount;
    $queries = data.queries;
    $resourceData = {
      resourceQueriesCount: data.resourceQueriesCount,
      resourceSlowQueries: data.resourceSlowQueries,
      resourceTime: data.resourceTime,
    };
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
