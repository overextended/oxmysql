import React from 'react';
import { Box, Center } from '@chakra-ui/react';

const Content: React.FC = ({ children }) => {
  return (
    <>
      <Center h="95%">
        <Box h="100%" w="95%" backgroundColor="#1B2129">
          {children}
        </Box>
      </Center>
    </>
  );
};

export default Content;
