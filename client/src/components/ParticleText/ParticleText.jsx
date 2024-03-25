import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from "@react-three/fiber";

const vertexShader = `

    uniform float uTime;
    varying float vDistance;

    float srandom(in float x) {
        return -1. + 2. * fract(sin(x) * 43758.5453);
    }

    void main() {
        vec3 particlePosition = vec3(position.x, position.y, srandom(position.z) * uTime);

        // float size = srandom(1.0) * 100.0 + 12.0;

        vec4 modelPosition = modelMatrix * vec4(particlePosition, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;

        gl_Position = projectedPosition;
        gl_PointSize = 15.0;
    }
`;

const fragmentShader = `
    varying float vDistance;

    void main() {
        vec3 color = vec3(1.0, 1.0, 1.0);
        float strength = distance(gl_PointCoord, vec2(0.5));
        strength = 1.0 - strength;
        strength = pow(strength, 3.0);

        color = mix(vec3(0.0), color, strength);
        gl_FragColor = vec4(color, strength);
    }

`

const ParticleText = ({socket, content, handleUpdateMainIndex}) => {

    const pointRef = useRef();
    const [speed, setSpeed] = useState(0);
    const [stringBox, setStringBox] = useState({
        wTexture: window.innerWidth,
        wScene: 0,
        hTexture: window.innerHeight,
        hScene: 0
    });

    const [offsetWidth, setOffsetWidth] = useState(1);
    const [ textureCoordinates, setTextureCoordinates] = useState([]);

    let textCtx;

    const fontName = "SF-Mono";
    const textureFontSize = 50;

    // let textureCoordinates = [];

    let textCanvas = document.createElement("canvas");
    textCanvas.width = textCanvas.height = 0;
    textCtx = textCanvas.getContext("2d");

    const samplingPoints = (content) => {

        const lines = content.split(`\n`);
        const linesNumber = lines.length;
        textCanvas.width = stringBox.wTexture;
        textCanvas.height = stringBox.hTexture;
        textCtx.font = textureFontSize + "px " + fontName;
        textCtx.fillStyle = "#2a9d8f";
        textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
        for (let i = 0; i < linesNumber; i++) {
            textCtx.fillText(
            lines[i],
            0,
            ((i + 0.8) * stringBox.hTexture) / linesNumber
            );
        }

        const samplingStep = 1;

          // Sample coordinates
        if (stringBox.wTexture > 0) {
            // Image data to 2d array
            const imageData = textCtx.getImageData(
            0,
            0,
            textCanvas.width,
            textCanvas.height
            );
            const imageMask = Array.from(
            Array(textCanvas.height),
            () => new Array(textCanvas.width)
            );
            for (let i = 0; i < textCanvas.height; i+= samplingStep) {
            for (let j = 0; j < textCanvas.width; j+= samplingStep) {
                imageMask[i][j] = imageData.data[(j + i * textCanvas.width) * 4] > 0;
            }
            }

            // Add new coordinates
            for (let i = 0; i < textCanvas.height; i++) {
            for (let j = 0; j < textCanvas.width; j++) {
                if (imageMask[i][j]) {
                textureCoordinates.push({
                    x: j,
                    y: i,
                });
                }
            }
            }
        } else {
            textureCoordinates = [];
        }
    }

    const particlesPosition = useMemo(() => {
            samplingPoints(content);

            if (textureCoordinates.length > 0) {
                 //to flip and center text
                // Gather with and height of the bounding box
                const maxX = textureCoordinates.map(v => v.x).sort((a, b) => (b - a))[0];
                const maxY = textureCoordinates.map(v => v.y).sort((a, b) => (b - a))[0];

                stringBox.wScene = maxX;
                stringBox.hScene = maxY;

                setOffsetWidth(maxX);
                
                const vertices = new Float32Array(textureCoordinates.length * 3);
        
                for (let i = 0; i < textureCoordinates.length; i++) {
                    vertices.set([textureCoordinates[i].x, stringBox.hScene - textureCoordinates[i].y,  15 * Math.random()], i * 3);
                }

                return vertices;
        
            }
    },[])

    const uniforms = useMemo(() => ({
        uTime: {
          value: 0.0
        },
    }), [])

    useEffect(() => {

        if (pointRef.current.geometry) {
            setTextureCoordinates([]);
            pointRef.current.geometry.dispose();
        }

        samplingPoints(content);

            if (textureCoordinates.length > 0) {
                const maxX = textureCoordinates.map(v => v.x).sort((a, b) => (b - a))[0];
                const maxY = textureCoordinates.map(v => v.y).sort((a, b) => (b - a))[0];

                stringBox.wScene = maxX;
                stringBox.hScene = maxY;

                setOffsetWidth(maxX);
                
                const vertices = new Float32Array(textureCoordinates.length * 3);
        
                for (let i = 0; i < textureCoordinates.length; i++) {
                    vertices.set([textureCoordinates[i].x, stringBox.hScene - textureCoordinates[i].y,  15 * Math.random()], i * 3);
                }

                const newAttribute = new THREE.BufferAttribute(vertices, 3);
                pointRef.current.geometry.setAttribute('position', newAttribute);
            }

    }, [content])
    
    useFrame((state, delta) => {

        if (speed !== 0) {
            pointRef.current.material.uniforms.uTime.value += speed;
        } else {
            if (pointRef.current.material.uniforms.uTime.value > 0) {
                pointRef.current.material.uniforms.uTime.value -= (500 * delta);
            } else {
                pointRef.current.material.uniforms.uTime.value = 0;
            }
        }
        
    });

    useEffect(() => {

        const onSerialData = (value) => {
            // console.log(value)
            let stringValue = value.data.split(", ");
            let sumSpeed = stringValue.reduce((partialSum, a) => Number(partialSum) + Number(a), 0);
            setSpeed(sumSpeed * 0.001);
        }

        socket.on('serialdata', onSerialData);
    },[socket])

    function usePrevious(value) {
        const ref = useRef();
        useEffect(() => {
          ref.current = value; //assign the value of ref to the argument
        },[value]); //this code will run when the value of 'value' changes
        return ref.current; //in the end, return the current ref value.
    }

    const prevSpeed = usePrevious(speed);

    useEffect(() => {
        if (prevSpeed > 0 && speed == 0) {
            handleUpdateMainIndex();
        }
    }, [prevSpeed]) 

    return (
        <group>
            <points ref={pointRef} position={[-0.5 * offsetWidth, -0.5 * 30, 0]}>
                <bufferGeometry>
                    <bufferAttribute 
                        attach={"attributes-position"}
                        count={particlesPosition.length / 3}
                        array={particlesPosition}
                        itemSize={3}
                        needsUpdate={true}
                    />
                </bufferGeometry>
                <shaderMaterial 
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    fragmentShader={fragmentShader}
                    vertexShader={vertexShader} 
                    uniforms={uniforms}
                />
                {/* <pointsMaterial 
                    size={1}
                    color="#5786F5"
                    sizeAttenuation
                    depthWrite={false}
                /> */}
            </points>
        </group>
    )
}

export default ParticleText;