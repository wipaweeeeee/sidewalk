import { useRef, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import socketIO from 'socket.io-client';
import host from '../../constants';

const Cube = () => {

    const env = 'test';
    let url = env == 'dev' ? host.local : host.ip; 

    const [socketClient, setSocketClient] = useState(null);

    useEffect(() => {
    
        setSocketClient(socketIO.connect(`${url}:4000`));

        return () => {
            if (socketClient) socketClient.disconnect();
        }
    
    },[])

    const Mesh = ({ socket }) => {
        const meshRef = useRef();
        const [speed, setSpeed] = useState(0);

        useEffect(() => {

            const onSerialData = (value) => {
                // console.log(value)
                let stringValue = value.data.split(", ");
                let sumSpeed = stringValue.reduce((partialSum, a) => Number(partialSum) + Number(a), 0);
                setSpeed(sumSpeed * 0.0001);
            }

            socket.on('serialdata', onSerialData);
        },[socket])

        console.log(speed)

        useFrame(() => {
            meshRef.current.rotation.y += speed;
        })

        return (
            <mesh ref={meshRef}>
                <ambientLight intensity={0.1} />
                <directionalLight color="red" position={[0, 0, 5]} />
                <boxGeometry args={[2, 2, 2]}/>
                <meshStandardMaterial />
            </mesh>
        )
    }

    return (
        <Canvas>
            <pointLight position={[5, 5, 5]} />
            <Mesh socket={socketClient}/>
        </Canvas>
    )
}

export default Cube;