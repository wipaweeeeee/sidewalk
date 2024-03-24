import { Fragment, useState } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import PageWrapper from './components/PageWrapper/PageWrapper';
import Cube from './components/Cube';

function App() {

    const [fontLoaded, setFontLoaded]  = useState(false);

    const SFMono = new FontFace('SF-Mono', 'url(./fonts/SF-Mono-Regular.otf)');

    SFMono.load().then(() => {
      document.fonts.add(SFMono);
      setFontLoaded(true);
  })

  const SamplePage = ({index}) => {

    return (
      <PageWrapper>
        { fontLoaded && <Cube index={index}/>}
      </PageWrapper>
    )
  } 

  const router = createBrowserRouter([
    {
      path: "/page1",
      element: <SamplePage index={0} />,
    },
    {
      path: "/page2",
      element: <SamplePage index={1} />,
    },
    {
      path: "/page3",
      element: <SamplePage index={2} />,
    },
    {
      path: "/page4",
      element: <SamplePage index={3} />,
    },
    {
      path: "/page5",
      element: <SamplePage index={4} />,
    },
    {
      path: "/page6",
      element: <SamplePage index={5} />,
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
