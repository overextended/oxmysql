import React from 'react';
import { Box, VStack } from '@chakra-ui/react';

const RightBar: React.FC = () => {
  return (
    <Box float="right" w="20%" h="max">
      <VStack align="left">
        <Box>Number of slow queries: 3</Box>
        <Box>Most active resource: essentialmode</Box>
        <Box>Total number of queries: 732</Box>
      </VStack>
    </Box>
  );
};

export default RightBar;
