import { useParams } from 'react-router-dom';
import React, { useEffect, useState, useMemo } from 'react';
import { fetchNui } from '../utils/fetchNui';
import { useNuiEvent } from '../hooks/useNuiEvent';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  chakra,
  Flex,
  IconButton,
  Text,
  Spinner,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import {
  TriangleDownIcon,
  TriangleUpIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ArrowRightIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { useTable, useSortBy, Column, usePagination, useFlexLayout } from 'react-table';
import { debugData } from '../utils/debugData';
import { setClipboard } from '../utils/setClipboard';

interface QueryData {
  date: number;
  query: string;
  executionTime: number;
  slow?: boolean;
}

interface TableData {
  query: string;
  executionTime: number;
  slow?: boolean;
}

interface NuiData {
  queries: QueryData[];
  pageCount: number;
}

const Resource: React.FC = () => {
  const { resource } = useParams();
  const toast = useToast();

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
      {
        Header: 'Slow',
        accessor: 'slow',
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
      initialState: { pageSize: 12, hiddenColumns: ['slow'] },
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
    debugData<NuiData>([
      {
        action: 'loadResource',
        data: {
          queries: [
            { query: 'SELECT * FROM `owned_vehicles`', date: 0, executionTime: 3.5 },
            { query: 'SELECT * FROM `users`', date: 0, executionTime: 7.3 },
            { query: 'SELECT * FROM `properties`', date: 0, executionTime: 25.7 },
          ],
          pageCount: 1,
        },
      },
    ]);
  }, [resource, pageIndex, sortBy]);

  useNuiEvent<NuiData>('loadResource', (data) => {
    setResourceData(data.queries);
    setTotalPages(data.pageCount);
    setIsLoaded(true);
  });

  const handleClick = (value: string) => {
    setClipboard(value);
    toast({
      title: 'Query copied to clipboard',
      duration: 2500,
      status: 'success',
    });
  };

  return (
    <Flex direction="column" justifyContent="space-between" alignItems="center" h="full">
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
              {page.map((row, index) => {
                prepareRow(row);
                return (
                  <Tr {...row.getRowProps()} key={`row-${index}`}>
                    {row.cells.map((cell, index) => (
                      <React.Fragment key={`row-${index}`}>
                        <Tooltip
                          isDisabled={cell.column.id === 'executionTime'}
                          label={cell.value}
                          openDelay={500}
                          key={`cell-${index}`}
                        >
                          <Td
                            {...cell.getCellProps()}
                            fontFamily="Poppins"
                            borderBottomColor="#313C4A"
                            color={row.values.slow && '#f3eca1'}
                            isTruncated={cell.column.id === 'query'}
                            textAlign={cell.column.id === 'executionTime' ? 'center' : 'left'}
                            onClick={(e) => cell.column.id === 'query' && handleClick(cell.value)}
                          >
                            {cell.render('Cell')}
                          </Td>
                        </Tooltip>
                      </React.Fragment>
                    ))}
                  </Tr>
                );
              })}
            </>
          )}
        </Tbody>
      </Table>

      {!isLoaded && <Spinner />}

      <Flex justifyContent="center" alignItems="center" p={3}>
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
