import { Box, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { debugData } from '../../utils/debugData';
import type { InitData } from '../../types';

const LeftBar: React.FC = () => {
  debugData([
    {
      action: 'init',
      data: {
        resources: ['ox_inventory', 'luke_garages', 'es_extended'],
        totalQueries: 732,
        totalTime: 258,
      },
    },
  ]);

  const [initData, setInitData] = useState<InitData>({ resources: [''], totalQueries: 0, totalTime: 0 });

  useNuiEvent<InitData>('openUI', (data) => {
    setInitData(data);
  });

  return (
    <Box p="1.2vh" fontSize="1.5vh" float="left" w="13%" height="55vh" overflowY="scroll">
      <VStack align="left">
        {initData.resources.map((resource, index) => (
          <Link to={resource} key={`${resource}-${index}`}>
            <Box _hover={{ transform: 'scale(1.1)', color: 'white' }} color="grey">
              {resource}
            </Box>
          </Link>
        ))}
      </VStack>
    </Box>
  );
};

export default LeftBar;
