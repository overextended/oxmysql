import { Center, Box } from '@chakra-ui/react';
import { debugData } from '../utils/debugData';
import TopBar from './NavBars/TopBar';
import LeftBar from './NavBars/LeftBar';
import { Routes, Route } from 'react-router-dom';
import Resource from './Resource';
import RightBar from './NavBars/RightBar';
import MainContent from './MainContent';

debugData([
  {
    action: 'openUI',
    data: {
      resources: ['ox_inventory', 'luke_garages', 'es_extended'],
      totalQueries: 732,
      totalTime: 258,
    },
  },
]);

const App: React.FC = () => {
  return (
    <Center w="100%" h="100%">
      <Box
        width="60%"
        height="50%"
        backgroundColor="#191E26"
        borderRadius="1vh"
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
    </Center>
  );
};

export default App;
