import { Box, VStack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import type { InitData } from '../../types';

const LeftBar: React.FC = () => {
  const [initData, setInitData] = useState<InitData>({ resources: [''], totalQueries: 0, totalTime: 0 });

  useNuiEvent<InitData>('openUI', (data) => {
    setInitData(data);
  });

  return (
    <Box p="1.2vh" fontSize="1.5vh" float="left" w="13%" height="90%" overflowY="scroll">
      <VStack align="left">
        {initData.resources.map((resource, index) => (
          <Box isTruncated key={`${resource}-${index}`}>
            <Link to={resource}>
              <Text _hover={{ color: 'white' }} color="grey">
                {resource}
              </Text>
            </Link>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default LeftBar;
