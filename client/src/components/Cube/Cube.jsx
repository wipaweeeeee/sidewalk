import { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import socketIO from 'socket.io-client';
import host from '../../constants';
import ParticleText from '../ParticleText';
import { OrbitControls } from "@react-three/drei";
import { data } from './data';

const Cube = ({ index }) => {

    const env = 'test';
    let url = env == 'dev' ? host.local : host.ip; 

    const [socketClient, setSocketClient] = useState(null);
    const [mainIndex, setMainIndex] = useState(0);
    const [cleanContent, setCleanContent] = useState([]);

    const max = data.length;

    useEffect(() => {
    
        setSocketClient(socketIO.connect(`${url}:4000`));

        return () => {
            if (socketClient) socketClient.disconnect();
        }
    
    },[])

    useEffect(() => {

        setCleanContent([]);

        let _array = [];
        const content = data[mainIndex].split(" ");
        for (var i = 0; i < content.length; i++) {
            _array.push(content[i].replaceAll("/", " "));
        }

        setCleanContent(_array);
    },[mainIndex])

    const handleUpdatePhrase = () => {
        if (mainIndex < max - 1) {
            setMainIndex(mainIndex => mainIndex + 1);
        } else {
            setMainIndex(0);
        }
    }

    // console.log(cleanContent[0])

    return (
        <>
            <button onClick={handleUpdatePhrase}>test</button>
            <Canvas camera={{ position: [0, 0, 160], fov: 45, near: 0.1, far: 1000, aspect: window.innerWidth/window.innerHeight  }}>
                <ParticleText socket={socketClient} content={cleanContent[index]} mainIndex={mainIndex}/>
                <OrbitControls />
            </Canvas>
        </>
    )
}

export default Cube;