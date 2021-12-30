import { useParams } from 'react-router-dom';
import { Box, Center } from '@chakra-ui/react';

const Resource: React.FC = () => {
  let { resource } = useParams();

  return (
    <Center h="95%">
      <Box h="100%" w="95%" backgroundColor="#1B2129">
        <h2>{resource}</h2>
      </Box>
    </Center>
  );
};

export default Resource;
