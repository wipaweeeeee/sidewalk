import Text from '../Text';
import PageWrapper from '../PageWrapper/PageWrapper';

const Page1 = ({stream}) => {
    return (
        <PageWrapper>
            <Text stream={stream}>
                page1
            </Text>
        </PageWrapper>
    )
}

export default Page1;