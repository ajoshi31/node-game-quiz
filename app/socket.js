import socket from 'socket.io';


const sockets = (server) => {
  const io = socket(server);
  io.on('connection', (Socket) => {
    console.log('socket connection made', Socket.id);
  });
};

export default sockets;
