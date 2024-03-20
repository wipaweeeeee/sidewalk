import socketIO from 'socket.io-client';
import { Fragment, useEffect, useState, useRef } from 'react';
import host from './constants';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Text from './components/Text';
import PageWrapper from './components/PageWrapper/PageWrapper';

function App() {

  const [stream, setStream] = useState(0);
  const socketRef = useRef();

  useEffect(() => {

    const env = 'test';

    let url = env == 'dev' ? host.local : host.ip; 
    socketRef.current = socketIO.connect(`${url}:4000`);

    socketRef.current.on('serialdata', (data) => {
      setStream((data.data).split(", "))
    })

  },[])

  const SamplePage = ({children, index}) => {

    return (
      <PageWrapper>
        <Text stream={stream} index={index}>{children}</Text>
      </PageWrapper>
    )
  } 

  const router = createBrowserRouter([
    {
      path: "/page1",
      element: <SamplePage index={0} stream={stream} />,
    },
    {
      path: "/page2",
      element: <SamplePage index={1} stream={stream} />,
    },
    {
      path: "/page3",
      element: <SamplePage index={2} stream={stream} />,
    },
    {
      path: "/page4",
      element: <SamplePage index={3} stream={stream} />,
    },
    {
      path: "/page5",
      element: <SamplePage index={4} stream={stream} />,
    },
    {
      path: "/page6",
      element: <SamplePage index={5} stream={stream} />,
    },
  ]);

  return (
    <Fragment>
      <RouterProvider router={router} /> 
        {/* <div className="container">
        {stream}
        <div className="item">hello</div> 
      </div> */}
    </Fragment>
    
  );
}

export default App;
