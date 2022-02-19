import { useState } from 'react';
import { Box, VStack, Center, Spacer, Flex, Text } from '@chakra-ui/react';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { VictoryPie, VictoryTooltip } from 'victory';
import type { InitData } from '../../types';

const RightBar: React.FC = () => {
  const [initData, setInitData] = useState<InitData>({
    totalQueries: 0,
    totalTime: 0,
    slowQueries: 0,
    resources: [''],
    chartData: [{ x: 0, y: 0, z: '' }],
  });

  // Debug data defined in LeftBar.tsx

  useNuiEvent<InitData>('openUI', (data) => {
    setInitData(data);
  });

  return (
    <Box float="right" w="3xs" h="100%" p={3}>
      <Center h="100%">
        <Flex direction="column" h="100%">
          <Box>
            <VStack align="left">
              <Text>Number of queries: {initData.totalQueries.toLocaleString('en-US')}</Text>
              <Text>Time querying: {Math.trunc(initData.totalTime).toLocaleString('en-US')} ms</Text>
              <Text color="#f3eca1">Slow queries: {initData.slowQueries.toLocaleString('en-US')}</Text>
            </VStack>
          </Box>
          <Spacer />
          <Box>
            <VictoryPie
              colorScale="qualitative"
              data={initData.chartData}
              labelComponent={<VictoryTooltip flyoutPadding={18} style={{ fontSize: 24 }} cornerRadius={15} />}
              style={{
                labels: {
                  fill: 'black',
                  fontFamily: 'Poppins',
                  fontSize: 28,
                },
              }}
              labels={({ datum }) => `${datum.z}: ${datum.x} (${Math.trunc(datum.y)}ms)`}
              labelPlacement="parallel"
            />
          </Box>
        </Flex>
      </Center>
    </Box>
  );
};

export default RightBar;
