import { useParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { fetchNui } from '../utils/fetchNui';
import { useNuiEvent } from '../hooks/useNuiEvent';
import { Table, Thead, Tbody, Tr, Th, Td, chakra, Flex, IconButton, Text, Spinner } from '@chakra-ui/react';
import {
  TriangleDownIcon,
  TriangleUpIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ArrowRightIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { useTable, useSortBy, Column, usePagination, useFlexLayout } from 'react-table';

interface QueryData {
  date: number;
  query: string;
  executionTime: number;
}

interface TableData {
  query: string;
  executionTime: number;
}

interface NuiData {
  queries: QueryData[];
  pageCount: number;
}

const Resource: React.FC = () => {
  const { resource } = useParams();

  const [isLoaded, setIsLoaded] = useState(false);
  const [resourceData, setResourceData] = useState<QueryData[]>([
    {
      date: 0,
      query: '',
      executionTime: 0,
    },
  ]);
  const [totalPages, setTotalPages] = useState(1);

  const data = useMemo<TableData[]>(() => resourceData, [resourceData]);

  const columns = useMemo<Column<TableData>[]>(
    () => [
      {
        Header: 'Query',
        accessor: 'query',
      },
      {
        Header: 'Execution time (ms)',
        accessor: 'executionTime',
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    state: { pageIndex, sortBy },
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 12 },
      manualPagination: true,
      manualSortBy: true,
      pageCount: totalPages,
      autoResetPage: false,
    },
    useSortBy,
    usePagination,
    useFlexLayout
  );

  useEffect(() => {
    fetchNui('fetchResource', { resource, pageIndex, sortBy });
    setIsLoaded(false);
  }, [resource, pageIndex, sortBy]);

  useNuiEvent<NuiData>('loadResource', (data) => {
    setResourceData(data.queries);
    setTotalPages(data.pageCount);
    setIsLoaded(true);
  });

  return (
    <Flex direction="column" justifyContent="space-between" alignItems="center" h="100%">
      <Table {...getTableProps()} size="sm">
        <Thead>
          {headerGroups.map((header): any => (
            <Tr {...header.getHeaderGroupProps()}>
              {header.headers.map((column) => (
                <Th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  color="white"
                  fontFamily="Poppins"
                  borderBottomColor="#313C4A"
                  textAlign="center"
                >
                  {column.render('Header')}
                  <chakra.span pl="4">
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <TriangleDownIcon aria-label="sorted descending" />
                      ) : (
                        <TriangleUpIcon aria-label="sorted ascending" />
                      )
                    ) : null}
                  </chakra.span>
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {isLoaded && (
            <>
              {page.map((row) => {
                prepareRow(row);
                return (
                  <Tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <Td
                        {...cell.getCellProps()}
                        fontFamily="Poppins"
                        wordBreak="break-word"
                        textOverflow="ellipsis"
                        overflow="hidden"
                        borderBottomColor="#313C4A"
                        textAlign={cell.column.id === 'executionTime' ? 'center' : 'left'}
                      >
                        {cell.render('Cell')}
                      </Td>
                    ))}
                  </Tr>
                );
              })}
            </>
          )}
        </Tbody>
      </Table>

      {!isLoaded && <Spinner />}

      <Flex mt={3} justifyContent="center " alignItems="center" p="1.2vh">
        <Flex>
          <IconButton
            icon={<ArrowLeftIcon h={3} w={3} color="black" />}
            aria-label="Last page"
            onClick={() => gotoPage(0)}
            size="sm"
            isDisabled={!canPreviousPage}
          />
          <IconButton
            aria-label="Previous page"
            onClick={previousPage}
            isDisabled={!canPreviousPage}
            icon={<ChevronLeftIcon h={6} w={6} color="black" />}
            size="sm"
            ml={4}
          />
        </Flex>
        <Text align="center" pl={4} pr={4}>
          Page {pageIndex + 1} of {pageOptions.length}
        </Text>
        <Flex>
          <IconButton
            aria-label="Next page"
            onClick={nextPage}
            size="sm"
            isDisabled={!canNextPage}
            icon={<ChevronRightIcon h={6} w={6} color="black" />}
          />
          <IconButton
            aria-label="Last page"
            onClick={() => gotoPage(pageCount - 1)}
            isDisabled={!canNextPage}
            icon={<ArrowRightIcon h={3} w={3} color="black" />}
            size="sm"
            ml={4}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Resource;
