const express = require('express');
const app = express();
const SOCKET_PORT = 4000;

const http = require('http').Server(app);
const cors = require('cors');

app.use(cors());


//SOCKET EMIT
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://192.168.1.228:3000"
    }
})

socketIO.on('connection', (socket) => {
    console.log('connected');

    // socket.on('message', (data) => {
    //     console.log(data);
        socketIO.emit('data', 'hello from server');
    // })

    socket.on('disconnect', () => {
        console.log('disconnected')
    })
})


//SERIAL PORT 
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline')
const port = new SerialPort({
    path: '/dev/cu.usbmodem11101',
    baudRate: 9600,
})
const parser = port.pipe(new ReadlineParser()); 
parser.on('data', (data) => {
    socketIO.emit('serialdata', { data: data })
})




app.get('/', (req, res) => {
    res.json({
        message: 'hello world'
    })
})

http.listen(SOCKET_PORT, () => {
    console.log(`server listening on ${SOCKET_PORT}`);
})