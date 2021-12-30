import { useParams } from "react-router-dom";

const Resource = () => {

    const { resource } = useParams();

    return <h1>{resource}</h1>;
}

export default Resource;