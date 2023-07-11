<script lang="ts">
  import IconChevronDown from '@tabler/icons-svelte/dist/svelte/icons/IconChevronDown.svelte';
  import IconChevronUp from '@tabler/icons-svelte/dist/svelte/icons/IconChevronUp.svelte';

  import { queries, type QueryData } from '../../../store';
  import {
    createSvelteTable,
    getCoreRowModel,
    type TableOptions,
    type ColumnDef,
    flexRender,
    type SortingState,
  } from '@tanstack/svelte-table';
  import { writable } from 'svelte/store';
  import { meta } from 'tinro';
  import { fetchNui } from '../../../utils/fetchNui';
  import { debouncedTablePage } from '../../../store';
  import QueryTooltip from './QueryTooltip.svelte';

  const route = meta();

  const columns: ColumnDef<QueryData, number>[] = [
    {
      accessorKey: 'query',
      header: 'Query',
      cell: (info) => info.getValue(),
      enableSorting: true,
    },
    {
      accessorKey: 'executionTime',
      header: 'Time (ms)',
      cell: (info) => info.getValue().toFixed(4),
      enableSorting: true,
    },
  ];

  let sorting: SortingState = [];

  const setSorting = (updater) => {
    if (updater instanceof Function) {
      sorting = updater(sorting);
    } else {
      sorting = updater;
    }
    options.update((old) => ({
      ...old,
      state: {
        ...old.state,
        sorting,
      },
    }));
  };

  const options = writable<TableOptions<QueryData>>({
    data: $queries,
    columns,
    manualPagination: true,
    manualSorting: true,
    pageCount: -1,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  $: options.update((prev) => ({ ...prev, data: $queries }));

  const table = createSvelteTable(options);

  $: {
    fetchNui('fetchResource', {
      resource: route.params.resource,
      pageIndex: $debouncedTablePage,
      sortBy: sorting,
    });
  }
</script>

<div class="px-4">
  <table class="w-full">
    <thead class="bg-dark-600">
      {#each $table.getHeaderGroups() as headerGroup}
        <tr>
          {#each headerGroup.headers as header}
            <th class={`p-1 bg-dark-600 select-none ${header.id === 'executionTime' ? 'w-1/4' : 'w-3/4'}`}>
              {#if !header.isPlaceholder}
                <button
                  class:cursor-pointer={header.column.getCanSort()}
                  class:select-none={header.column.getCanSort()}
                  class="flex items-center justify-center w-full gap-1"
                  on:click={header.column.getToggleSortingHandler()}
                >
                  <svelte:component this={flexRender(header.column.columnDef.header, header.getContext())} />
                  {#if header.column.getIsSorted() === 'asc'}
                    <IconChevronUp />
                  {:else if header.column.getIsSorted() === 'desc'}
                    <IconChevronDown />
                  {/if}
                </button>
              {/if}
            </th>
          {/each}
        </tr>
      {/each}
    </thead>
    <tbody>
      {#each $table.getRowModel().rows as row}
        <tr>
          {#each row.getVisibleCells() as cell}
            <QueryTooltip
              content={cell.getValue()}
              let:floatingRef
              let:displayTooltip
              let:hideTooltip
              disabled={cell.column.id !== 'query'}
            >
              <td
                use:floatingRef
                on:mouseenter={displayTooltip}
                on:mouseleave={hideTooltip}
                class={`${cell.column.id === 'executionTime' && 'text-center'} p-2 bg-dark-700 ${
                  row.original.slow && 'text-yellow-500'
                } truncate max-w-[200px]`}
              >
                <svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())} />
              </td>
            </QueryTooltip>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
