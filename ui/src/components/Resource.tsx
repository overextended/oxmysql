import { useParams } from 'react-router-dom';

const Resource: React.FC = () => {
  let { resource } = useParams();

  return <h2>{resource}</h2>;
};

export default Resource;
