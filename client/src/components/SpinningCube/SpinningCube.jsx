import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";

const SpinningCube = ({ socket }) => {
    const meshRef = useRef();
    const [speed, setSpeed] = useState(0);

    useEffect(() => {

        const onSerialData = (value) => {
            // console.log(value)
            let stringValue = value.data.split(", ");
            let sumSpeed = stringValue.reduce((partialSum, a) => Number(partialSum) + Number(a), 0);
            setSpeed(sumSpeed * 0.0001);
        }

        // socket.on('serialdata', onSerialData);
    },[socket])

    // console.log(speed)

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

export default SpinningCube;