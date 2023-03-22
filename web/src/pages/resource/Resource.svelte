<script lang="ts">
  import {
    IconChevronDown,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconChevronUp,
  } from '@tabler/icons-svelte';
  import { readable } from 'svelte/store';
  import { meta, router } from 'tinro';
  import { createTable, Render, Subscribe } from 'svelte-headless-table';
  import { addSortBy } from 'svelte-headless-table/plugins';

  const data = readable([
    {
      query: 'SELECT * FROM users WHERE ID = 1',
      time: 13,
    },
    { query: 'SELECT * FROM users WHERE ID = 1', time: 15 },
    { query: 'SELECT * FROM users WHERE ID = 1', time: 13 },
    { query: 'SELECT * FROM users WHERE ID = 1', time: 32 },
    { query: 'SELECT * FROM users WHERE ID = 1', time: 13 },
    { query: 'SELECT * FROM users WHERE ID = 1', time: 11 },
    { query: 'SELECT * FROM users WHERE ID = 1', time: 13 },
    { query: 'SELECT * FROM users WHERE ID = 1', time: 15 },
    { query: 'SELECT * FROM users WHERE ID = 1', time: 13 },
    { query: 'SELECT * FROM users WHERE ID = 1', time: 32 },
  ]);

  const table = createTable(data, {
    sort: addSortBy(),
  });

  const columns = table.createColumns([
    table.column({
      header: 'Query',
      accessor: 'query',
      plugins: {
        sort: {},
      },
    }),
    table.column({
      header: 'Time (ms)',
      accessor: 'time',
      plugins: {
        sort: {},
      },
    }),
  ]);

  const { headerRows, rows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns);

  const route = meta();
</script>

<div class="flex flex-col w-full justify-between">
  <div>
    <div class="p-4 flex items-center">
      <button
        on:click={() => router.goto('/')}
        class="flex p-2 bg-dark-600 text-dark-100 hover:text-white rounded-md justify-center items-center hover:bg-dark-500 outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
      >
        <IconChevronLeft />
        Resources
      </button>
    </div>
    <table {...$tableAttrs} class="w-full">
      <thead class="bg-dark-600">
        {#each $headerRows as headerRow (headerRow.id)}
          <Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
            <tr {...rowAttrs}>
              {#each headerRow.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
                  <th {...attrs} on:click={props.sort.toggle} class="p-1 border-b-[1px] border-dark-400">
                    <div class="flex justify-center items-center gap-2 select-none cursor-pointer">
                      <Render of={cell.render()} />
                      {#if props.sort.order === 'asc'}
                        <IconChevronDown />
                      {:else if props.sort.order === 'desc'}
                        <IconChevronUp />
                      {/if}
                    </div>
                  </th>
                </Subscribe>
              {/each}
            </tr>
          </Subscribe>
        {/each}
      </thead>
      <tbody {...$tableBodyAttrs}>
        {#each $rows as row (row.id)}
          <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
            <tr {...rowAttrs}>
              {#each row.cells as cell (cell.id)}
                <Subscribe attrs={cell.attrs()} let:attrs>
                  <td
                    {...attrs}
                    class={`${
                      cell.id === 'time' && 'text-center'
                    } p-2 bg-dark-700 border-b-[1px] border-dark-400 truncate max-w-[200px]`}
                  >
                    <Render of={cell.render()} />
                  </td>
                </Subscribe>
              {/each}
            </tr>
          </Subscribe>
        {/each}
      </tbody>
    </table>
    <div />
  </div>
  <div class="flex justify-center items-center gap-6 p-6">
    <button
      class="bg-dark-600 text-dark-100 hover:text-white focus-visible:text-white rounded-md hover:bg-dark-500 p-2 active:translate-y-[3px] outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
    >
      <IconChevronsLeft />
    </button>
    <button
      class="bg-dark-600 text-dark-100 hover:text-white focus-visible:text-white rounded-md hover:bg-dark-500 p-2 active:translate-y-[3px] outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
    >
      <IconChevronLeft />
    </button>
    <p>Page 1 of 13</p>
    <button
      class="bg-dark-600 text-dark-100 hover:text-white focus-visible:text-white rounded-md hover:bg-dark-500 p-2 active:translate-y-[3px] outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
    >
      <IconChevronRight />
    </button>
    <button
      class="bg-dark-600 text-dark-100 hover:text-white focus-visible:text-white rounded-md hover:bg-dark-500 p-2 active:translate-y-[3px] outline-none border-[1px] border-transparent focus-visible:border-cyan-600"
    >
      <IconChevronsRight />
    </button>
  </div>
</div>
