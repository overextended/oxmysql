import { Box, VStack } from '@chakra-ui/react';

const SideBar: React.FC = () => {
  return (
    <Box p="1.2vh" fontSize="1.5vh" position="fixed">
      <VStack align="left">
        <Box>es_extended</Box>
        <Box>ox_inventory</Box>
        <Box>luke_garages</Box>
      </VStack>
    </Box>
  );
};

export default SideBar;
