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

const ParticleText = ({socket, content}) => {

    const pointRef = useRef();
    const [speed, setSpeed] = useState(0);
    const [stringBox, setStringBox] = useState({
        wTexture: window.innerWidth,
        wScene: 0,
        hTexture: window.innerHeight,
        hScene: 0
    });

    const [offsetWidth, setOffsetWidth] = useState(1);

    let textCtx;

    const fontName = "SF-Mono";
    const textureFontSize = 50;

    let textureCoordinates = [];
    let particles = [];

    let textCanvas = document.createElement("canvas");
    textCanvas.width = textCanvas.height = 0;
    textCtx = textCanvas.getContext("2d");

    const samplingPoints = () => {
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

            if (textureCoordinates.length !== 0) {
                textureCoordinates = textureCoordinates.filter((c) => !c.toDelete);
                particles = particles.filter((c) => !c.toDelete);

                textureCoordinates.forEach((c) => {
                    if (imageMask[c.y]) {
                    if (imageMask[c.y][c.x]) {
                        c.old = true;
                        if (!c.toDelete) {
                        imageMask[c.y][c.x] = false;
                        }
                    } else {
                        c.toDelete = true;
                    }
                    } else {
                    c.toDelete = true;
                    }
                });
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
            samplingPoints();
            //to flip and center text
            // Gather with and height of the bounding box
            const maxX = textureCoordinates.map(v => v.x).sort((a, b) => (b - a))[0];
            const maxY = textureCoordinates.map(v => v.y).sort((a, b) => (b - a))[0];

            // setStringBox(prevState => ({...prevState, wScene: maxX, hScene: maxY}));
            stringBox.wScene = maxX;
            stringBox.hScene = maxY;

            setOffsetWidth(maxX);
            
            const vertices = new Float32Array(textureCoordinates.length * 3);
    
            for (let i = 0; i < textureCoordinates.length; i++) {
                vertices.set([textureCoordinates[i].x, stringBox.hScene - textureCoordinates[i].y,  15 * Math.random()], i * 3);
            }
    
            return vertices;
    
    },[stringBox])

    const uniforms = useMemo(() => ({
        uTime: {
          value: 0.0
        },
    }), [])
    
    useFrame((state, delta) => {

        if (speed !== 0) {
            pointRef.current.material.uniforms.uTime.value += speed;
        } else {
            //TODO: add a lerp here so it goes to zero not so abrupt
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

    // console.log(speed)
    return (
        <group>
            <points ref={pointRef} position={[-0.5 * offsetWidth, -0.5 * 30, 0]}>
                <bufferGeometry>
                    <bufferAttribute 
                        attach={"attributes-position"}
                        count={particlesPosition.length/3}
                        array={particlesPosition}
                        itemSize={3}
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