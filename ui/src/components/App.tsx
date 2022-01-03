import { Center, Box, BoxProps } from '@chakra-ui/react';
import { debugData } from '../utils/debugData';
import { motion } from 'framer-motion';
import TopBar from './NavBars/TopBar';
import LeftBar from './NavBars/LeftBar';
import { Routes, Route } from 'react-router-dom';
import Resource from './Resource';
import RightBar from './NavBars/RightBar';
import MainContent from './MainContent';
import { useVisibility } from '../providers/VisibilityProvider';

debugData([
  {
    action: 'setVisible',
    data: true,
  },
]);

const MotionBox = motion<BoxProps>(Box);

const App: React.FC = () => {
  const { visible } = useVisibility();

  return (
    <Center w="100%" h="100%">
      {visible && (
        <MotionBox
          animate={{ y: [100, 0] }}
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
            </Routes>
          </MainContent>
        </MotionBox>
      )}
    </Center>
  );
};

export default App;
