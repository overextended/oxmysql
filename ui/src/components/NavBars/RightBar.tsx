import React from 'react';
import { Box, VStack, Center } from '@chakra-ui/react';

const RightBar: React.FC = () => {
  return (
    <Box float="right" w="20%" h="max" p="1.2vh">
      <Center>
        <VStack align="left">
          <Box>Number of slow queries: 3</Box>
          <Box>Most active resource: essentialmode</Box>
          <Box>Total number of queries: 732</Box>
        </VStack>
      </Center>
    </Box>
  );
};

export default RightBar;
