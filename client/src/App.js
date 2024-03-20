import socketIO from 'socket.io-client';
import { Fragment, useEffect, useState } from 'react';
import host from './constants';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Text from './components/Text';
import PageWrapper from './components/PageWrapper/PageWrapper';

function App() {

  const [stream, setStream] = useState(0);

  useEffect(() => {

    const env = 'test';

    let url = env == 'dev' ? host.local : host.ip; 
    const socket = socketIO.connect(`${url}:4000`);

    socket.on('serialdata', (data) => setStream((data.data).split(", ")))

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
      element: <SamplePage index={0}>what</SamplePage>,
    },
    {
      path: "/page2",
      element: <SamplePage index={1}>is</SamplePage>,
    },
    {
      path: "/page3",
      element: <SamplePage index={2}>the</SamplePage>,
    },
    {
      path: "/page4",
      element: <SamplePage index={3}>meaning</SamplePage>,
    },
    {
      path: "/page5",
      element: <SamplePage index={4}>of</SamplePage>,
    },
    {
      path: "/page6",
      element: <SamplePage index={5}>life</SamplePage>,
    },
  ]);


  // console.log(stream)

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
