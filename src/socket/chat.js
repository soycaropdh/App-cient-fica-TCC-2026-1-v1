const { crearNotificacion, notificarMiembros } = require('../controllers/notificacionController');

const setupSocket = (io) => {
  const usuariosConectados = {};
  const historialMensajes = {};

  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    // Usuario se registra con su ID para recibir notificaciones personales
    socket.on('registrar', (usuarioId) => {
      socket.join(`usuario_${usuarioId}`);
      usuariosConectados[socket.id] = usuarioId;
      console.log(`Usuario ${usuarioId} registrado para notificaciones`);
    });

    // Usuario se une al chat de un proyecto
    socket.on('unirseChat', ({ proyectoId, nombre }) => {
      const sala = `proyecto_${proyectoId}`;
      socket.join(sala);
      console.log(`${nombre} se unió al chat del proyecto ${proyectoId}`);

      // Inicializar historial si no existe
      if (!historialMensajes[proyectoId]) {
        historialMensajes[proyectoId] = [];
      }

      // Enviar historial al usuario
      socket.emit('historial', historialMensajes[proyectoId]);

      // Notificar a los demás
      const mensajeSistema = {
        usuario: 'Sistema',
        texto: `${nombre} se ha unido al chat`,
        hora: new Date().toLocaleTimeString()
      };
      historialMensajes[proyectoId].push(mensajeSistema);
      io.to(sala).emit('mensaje', mensajeSistema);
    });

    // Recibir mensaje de proyecto
    socket.on('mensajeProyecto', async ({ proyectoId, usuario, texto, usuarioId }) => {
      const sala = `proyecto_${proyectoId}`;
      const nuevoMensaje = {
        usuario,
        texto,
        hora: new Date().toLocaleTimeString()
      };

      if (!historialMensajes[proyectoId]) {
        historialMensajes[proyectoId] = [];
      }

      historialMensajes[proyectoId].push(nuevoMensaje);
      io.to(sala).emit('mensaje', nuevoMensaje);

      // Notificar a miembros del proyecto
      await notificarMiembros(io, proyectoId, {
        titulo: '💬 Nuevo mensaje',
        mensaje: `${usuario}: ${texto.substring(0, 50)}${texto.length > 50 ? '...' : ''}`,
        tipo: 'nuevo_mensaje',
        excluirUsuarioId: usuarioId
      });
    });

    // Canal público general
    socket.on('unirse', (nombre) => {
      usuariosConectados[socket.id] = nombre;
      if (!historialMensajes['publico']) historialMensajes['publico'] = [];

      socket.emit('historial', historialMensajes['publico']);

      const mensajeSistema = {
        usuario: 'Sistema',
        texto: `${nombre} se ha unido al canal público`,
        hora: new Date().toLocaleTimeString()
      };
      historialMensajes['publico'].push(mensajeSistema);
      io.emit('mensaje', mensajeSistema);
      io.emit('usuariosConectados', Object.values(usuariosConectados));
    });

    socket.on('mensajePublico', (data) => {
      if (!historialMensajes['publico']) historialMensajes['publico'] = [];
      const nuevoMensaje = {
        usuario: data.usuario,
        texto: data.texto,
        hora: new Date().toLocaleTimeString()
      };
      historialMensajes['publico'].push(nuevoMensaje);
      io.emit('mensaje', nuevoMensaje);
    });

    // Desconexión
    socket.on('disconnect', () => {
      const usuarioId = usuariosConectados[socket.id];
      if (usuarioId) {
        delete usuariosConectados[socket.id];
        console.log(`Usuario ${usuarioId} desconectado`);
      }
    });
  });
};

module.exports = setupSocket;