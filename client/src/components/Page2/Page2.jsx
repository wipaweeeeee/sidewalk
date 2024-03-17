import Text from '../Text'; 
import PageWrapper from '../PageWrapper/PageWrapper';

const Page2 = ({stream}) => {
    return (
        <PageWrapper>
            <Text stream={stream}>
                page2
            </Text>
        </PageWrapper>
    )
}

export default Page2;