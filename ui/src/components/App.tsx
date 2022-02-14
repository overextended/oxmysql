import { Flex, Box } from '@chakra-ui/react';
import { debugData } from '../utils/debugData';
import TopBar from './NavBars/TopBar';
import LeftBar from './NavBars/LeftBar';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Resource from './Resource';
import RightBar from './NavBars/RightBar';
import MainContent from './MainContent';
import { useNuiEvent } from '../hooks/useNuiEvent';

debugData([
  {
    action: 'openUI',
    data: {
      resources: ['ox_inventory', 'luke_garages', 'es_extended'],
      totalQueries: 732,
      totalTime: 258,
      slowQueries: 6,
      chartData: [
        { x: 13, y: 350, z: 'ox_inventory' },
        { x: 27, y: 752, z: 'es_extended' },
        { x: 41, y: 52, z: 'luke_garages' },
      ],
    },
  },
]);

const App: React.FC = () => {
  const navigate = useNavigate();

  useNuiEvent('openUI', () => navigate('/'));

  return (
    <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
      <Box
        width="6xl"
        height="lg"
        backgroundColor="#191E26"
        borderRadius="lg"
        color="white"
        fontFamily="Poppins"
        userSelect="none"
      >
        <TopBar />
        <LeftBar />
        <RightBar />
        <MainContent>
          <Routes>
            <Route path="/:resource" element={<Resource />} />
            <Route path="/" element={<></>} />
          </Routes>
        </MainContent>
      </Box>
    </Flex>
  );
};

export default App;
