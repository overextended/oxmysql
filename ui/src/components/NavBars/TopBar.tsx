import { Box, Text } from '@chakra-ui/react';

const TopBar: React.FC = () => {
  return (
    <Box w="full" h="4xs">
      <Text paddingLeft={3} fontSize="lg">
        Resources
      </Text>
    </Box>
  );
};

export default TopBar;
