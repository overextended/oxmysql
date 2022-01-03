import { useParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { fetchNui } from '../utils/fetchNui';
import { useNuiEvent } from '../hooks/useNuiEvent';
import { debugData } from '../utils/debugData';
import { Table, Thead, Tbody, Tr, Th, Td, chakra, Flex, IconButton, Text } from '@chakra-ui/react';
import {
  TriangleDownIcon,
  TriangleUpIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ArrowRightIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { useTable, useSortBy, Column, usePagination } from 'react-table';

interface QueryData {
  date: number;
  query: string;
  executionTime: number;
}

interface TableData {
  query: string;
  executionTime: number;
}

const Resource: React.FC = () => {
  let { resource } = useParams();
  const [resourceData, setResourceData] = useState<QueryData[]>([
    {
      date: 0,
      query: '',
      executionTime: 0,
    },
  ]);

  useEffect(() => {
    fetchNui('fetchResource', resource);
    debugData([
      {
        action: 'loadResource',
        data: [
          { query: 'SELECT * FROM `users`', executionTime: 5 },
          { query: 'SELECT * FROM `owned_vehicles`', executionTime: 2 },
          { query: 'SELECT * FROM `properties`', executionTime: 7 },
          { query: 'SELECT * FROM `phone_messages`', executionTime: 13 },
        ],
      },
    ]);
  }, [resource]);

  useNuiEvent<QueryData[]>('loadResource', (data) => {
    setResourceData(data);
  });

  const data = useMemo<TableData[]>(() => resourceData, [resourceData]);

  const columns = useMemo<Column<TableData>[]>(
    () => [
      {
        Header: 'Query',
        accessor: 'query',
      },
      {
        Header: 'Execution time',
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
    state: { pageIndex },
    prepareRow,
  } = useTable({ columns, data, initialState: { pageSize: 12 } }, useSortBy, usePagination);

  // Todo: pagination
  return (
    <>
      <Table {...getTableProps} size="sm">
        <Thead>
          {headerGroups.map((header): any => (
            <Tr {...header.getHeaderGroupProps()}>
              {header.headers.map((column) => (
                <Th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  color="white"
                  fontFamily="Poppins"
                  borderBottomColor="#313C4A"
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
                  >
                    {cell.render('Cell')}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
      </Table>

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
    </>
  );
};

export default Resource;
