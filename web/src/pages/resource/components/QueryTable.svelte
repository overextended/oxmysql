<script lang="ts">
  import { IconChevronDown, IconChevronUp } from '@tabler/icons-svelte';
  import { createTable, Render, Subscribe } from 'svelte-headless-table';
  import { addSortBy } from 'svelte-headless-table/plugins';
  import { readable } from 'svelte/store';
  
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
</script>

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