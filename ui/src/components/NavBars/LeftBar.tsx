import { Box, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import type { InitData } from '../../types';

const LeftBar: React.FC = () => {
  const [initData, setInitData] = useState<InitData>({
    resources: [''],
    totalQueries: 0,
    totalTime: 0,
    slowQueries: 0,
    chartData: [{ x: 0, y: 0, z: '' }],
  });

  useNuiEvent<InitData>('openUI', (data) => {
    setInitData(data);
  });

  return (
    <Box pl={3} pr={3} pb={3} pt={2} fontSize="md" float="left" w={150} height="90%" overflowY="scroll">
      <VStack align="left">
        {initData.resources.map((resource, index) => (
          <Box isTruncated key={`${resource}-${index}`}>
            <NavLink
              to={resource}
              style={(state) => ({
                color: state.isActive ? 'white' : 'grey',
              })}
            >
              <Box _hover={{ color: 'white' }} isTruncated>
                {resource}
              </Box>
            </NavLink>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default LeftBar;
