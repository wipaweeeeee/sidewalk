import styles from './styles.module.scss';

const PageWrapper = ({children}) => {
    return (
        <div className={styles.container}>{children}</div>
    )
}

export default PageWrapper;