import { Box, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const SideBar: React.FC = () => {
  return (
    <Box p="1.2vh" fontSize="1.5vh" float="left">
      <VStack align="left">
        <Link to="es_extended">es_extended</Link>
        <Link to="ox_inventory">ox_inventory</Link>
        <Link to="luke_garages">luke_garages</Link>
      </VStack>
    </Box>
  );
};

export default SideBar;
