const setupSocket = (io) => {
  const usuariosConectados = {};
  const historialMensajes = []; // Guardamos mensajes en memoria

  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    // Cuando alguien se une, le enviamos el historial
    socket.on('unirse', (nombre) => {
      usuariosConectados[socket.id] = nombre;

      // Enviar historial al nuevo usuario
      socket.emit('historial', historialMensajes);

      // Notificar a todos que alguien se unió
      const mensajeSistema = {
        usuario: 'Sistema',
        texto: `${nombre} se ha unido al canal público`,
        hora: new Date().toLocaleTimeString()
      };
      historialMensajes.push(mensajeSistema);
      io.emit('mensaje', mensajeSistema);

      // Actualizar lista de conectados
      io.emit('usuariosConectados', Object.values(usuariosConectados));
    });

    // Recibir y reenviar mensajes
    socket.on('mensajePublico', (data) => {
      const nuevoMensaje = {
        usuario: data.usuario,
        texto: data.texto,
        hora: new Date().toLocaleTimeString()
      };
      historialMensajes.push(nuevoMensaje);
      io.emit('mensaje', nuevoMensaje);
    });

    // Usuario se desconecta
    socket.on('disconnect', () => {
      const nombre = usuariosConectados[socket.id];
      if (nombre) {
        delete usuariosConectados[socket.id];

        const mensajeSistema = {
          usuario: 'Sistema',
          texto: `${nombre} ha salido del canal`,
          hora: new Date().toLocaleTimeString()
        };
        historialMensajes.push(mensajeSistema);
        io.emit('mensaje', mensajeSistema);
        io.emit('usuariosConectados', Object.values(usuariosConectados));
      }
    });
  });
};

module.exports = setupSocket;