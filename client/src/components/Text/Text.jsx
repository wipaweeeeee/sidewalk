import styles from './styles.module.scss';

const Text = ({children, stream, index}) => {

    function clamp(input, min, max) {
        return input < min ? min : input > max ? max : input;
    }

    function map(current, in_min, in_max, out_min, out_max) {
        const mapped = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
        return clamp(mapped, out_min, out_max);
    }

    let blur = map(stream[index], 0, 1023, 0, 30);

    return (
        <div className={styles.text} style={{ filter: `blur(${blur}px)`}}>
            {children}
        </div>
    )
}

export default Text;