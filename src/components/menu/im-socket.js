import io from 'socket.io-client';

export default ({ tenantId = 1, to, toType = 'EMPLOYEE', channel = 'web' }) => (...args) => new Promise((resolve, reject) => {
  const socket = io(...args);

  function regist(cb) {
    socket.emit('regist', { tenantId, to, toType, channel }, cb);
  }

  socket.on('reconnect', () => regist());

  socket.on('connect', () => {
    regist(({ code }) => {
      if (code === '0') {
        resolve(socket);
      } else {
        reject(new Error('fail to regist im'));
      }
    });
  });

  ['connect_error', 'connect_timeout'].forEach(event => socket.on(event, reject));
});
