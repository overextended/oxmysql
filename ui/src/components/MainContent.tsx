import React from 'react';
import { Box, Center } from '@chakra-ui/react';

const MainContent: React.FC = ({ children }) => {
  return (
    <>
      <Center h="95%" alignItems="stretch">
        <Box h="100%" w="50%" backgroundColor="#1B2129" flex="1">
          {children}
        </Box>
      </Center>
    </>
  );
};

export default MainContent;
