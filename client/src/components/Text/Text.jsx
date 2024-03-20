import styles from './styles.module.scss';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

const data = [
    {content: 'what'},
    {content: 'am I'},
    {content: 'doing'},
    {content: 'with'},
    {content: 'my'},
    {content: 'life'},
]

const Text = ({index, stream}) => {

    const [letter, setLetter] = useState("");

    const handleRandomLetter = () => { 
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        console.log(randomIndex)
        setLetter(alphabet[randomIndex]);
    }

    function clamp(input, min, max) {
        return input < min ? min : input > max ? max : input;
    }

    function map(current, in_min, in_max, out_min, out_max) {
        const mapped = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
        return clamp(mapped, out_min, out_max);
    }

    // let blur = map(stream[index], 0, 1023, 0, 30);
    let blur = 0;

    let sumSpeed = stream && stream.reduce((partialSum, a) => Number(partialSum) + Number(a), 0);
    let normalizedSpeed = map(sumSpeed, 0, 4000, 0, 5000);
    // console.log(normalizedSpeed)

    useEffect(() => {
        if (normalizedSpeed > 0) {
            handleRandomLetter();
        } else {
            setLetter(null);
        }
        
    },[stream])

    const variants = {
        normal: {
            y: '0%',
            transition: {
                duration: 0.5
            }
        }, 
        shuffle: {
            y: '-100%',
            transition: {
                duration: 0.5
            }
        }
    }

    // console.log(stream)

    let letterArray = data[index].content.split("");
    let content = [];
    for (var i = 0; i < letterArray.length; i++) {
        content.push(
            <motion.div 
                key={i}
                initial={false}
                variants={variants}
            >
                {letter == null ? letterArray[i] : letter}
            </motion.div>)
    }

    return (
        <div className={styles.text} style={{ filter: `blur(${blur}px)`}}>
            {content}
        </div>
    )
}

export default Text;