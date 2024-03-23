import { useRef, useMemo } from 'react';
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
        gl_PointSize = 30.0;
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

const ParticleText = () => {

    const pointRef = useRef();

    let textCtx;

    const fontName = "Verdana";
    const textureFontSize = 25;
    const fontScaleFactor = 0.18;

    let string = 'fuck me';
    let textureCoordinates = [];
    let particles = [];

    let stringBox = {
        wTexture: 100,
        wScene: 18,
        hTexture: 28,
        hScene: 5.04
    };

    let textCanvas = document.createElement("canvas");
    textCanvas.width = textCanvas.height = 0;
    textCtx = textCanvas.getContext("2d");

    const particlesPosition = useMemo(() => {
        const lines = string.split(`\n`);
        const linesNumber = lines.length;
        textCanvas.width = stringBox.wTexture;
        textCanvas.height = stringBox.hTexture;
        textCtx.font = "100 " + textureFontSize + "px " + fontName;
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
            // Clean up: delete coordinates and particles which disappeared on the prev step
            // We need to keep same indexes for coordinates and particles to reuse old particles properly
            textureCoordinates = textureCoordinates.filter((c) => !c.toDelete);
            particles = particles.filter((c) => !c.toDelete);

            // Go through existing coordinates (old to keep, toDelete for fade-out animation)
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

        //to flip and center text
        // Gather with and height of the bounding box
        const maxX = textureCoordinates.map(v => v.x).sort((a, b) => (b - a))[0];
        const maxY = textureCoordinates.map(v => v.y).sort((a, b) => (b - a))[0];
        stringBox.wScene = maxX;
        stringBox.hScene = maxY;
        
        const vertices = new Float32Array(textureCoordinates.length * 3);

        for (let i = 0; i < textureCoordinates.length; i++) {
            vertices.set([textureCoordinates[i].x, stringBox.hScene - textureCoordinates[i].y,  15 * Math.random()], i * 3);
        }

        return vertices;
        
    },[])

    const uniforms = useMemo(() => ({
        uTime: {
          value: 0.0
        },
    }), [])
    
    useFrame((state) => {
        const { clock } = state;

        pointRef.current.material.uniforms.uTime.value = clock.elapsedTime * 0;
    });

    return (
        <group position={[-0.5 * stringBox.wScene, -0.125 * stringBox.wScene, 0]}>
            <points ref={pointRef}>
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