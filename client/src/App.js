import socketIO from 'socket.io-client';
import { useEffect, useState } from 'react';

const socket = socketIO.connect('http://192.168.1.228:4000');

function App() {

  const [stream, setStream] = useState();

  useEffect(() => {
    socket.on('serialdata', (data) => setStream(data.data))
  },[socket, stream])

  return (
    <div style={{ fontSize: '90px', textOrientation: 'upright', writingMode: 'vertical-lr'}}>
      {stream}
    </div>
  );
}

export default App;
