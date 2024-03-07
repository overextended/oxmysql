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
  import { filterData } from '../../store';
  import QuerySearch from './components/QuerySearch.svelte';
  import IconSearch from '@tabler/icons-svelte/dist/svelte/icons/IconSearch.svelte';

  let maxPage = 0;

  onDestroy(() => {
    $queries = [];
    $filterData.page = 0;
  });

  interface ResourceData {
    queries: QueryData[];
    pageCount: number;
    resourceQueriesCount: number;
    resourceSlowQueries: number;
    resourceTime: number;
  }

  debugData<ResourceData>([
    {
      action: 'loadResource',
      data: {
        queries: [
          { query: 'SELECT * FROM users WHERE ID = 1', executionTime: 3, slow: false, date: Date.now() },
          { query: 'SELECT * FROM users WHERE ID = 1', executionTime: 23, slow: true, date: Date.now() },
          { query: 'SELECT * FROM users WHERE ID = 1', executionTime: 15, slow: false, date: Date.now() },
          { query: 'SELECT * FROM users WHERE ID = 1', executionTime: 122, slow: true, date: Date.now() },
        ],
        resourceQueriesCount: 3,
        resourceSlowQueries: 2,
        resourceTime: 1342,
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
</script>

<div class="flex w-full flex-col justify-between">
  <div>
    <ResourceHeader />
    <QuerySearch icon={IconSearch} />
    <QueryTable />
  </div>
  <Pagination {maxPage} />
</div>
