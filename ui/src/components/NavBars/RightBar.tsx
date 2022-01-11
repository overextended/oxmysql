import { useState } from 'react';
import { Box, VStack, Center } from '@chakra-ui/react';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import type { InitData } from '../../types';

const RightBar: React.FC = () => {
  const [initData, setInitData] = useState<InitData>({ totalQueries: 0, totalTime: 0, resources: [''] });

  // Debug data defined in LeftBar.tsx

  useNuiEvent<InitData>('openUI', (data) => {
    setInitData(data);
  });

  return (
    <Box float="right" w="20%" h="max" p="1.2vh">
      <Center>
        <VStack align="left">
          <Box>Total number of queries: {initData.totalQueries}</Box>
          <Box>Total amount of time querying: {Math.trunc(initData.totalTime)} ms</Box>
        </VStack>
      </Center>
    </Box>
  );
};

export default RightBar;
