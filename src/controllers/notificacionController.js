const Notificacion = require('../models/Notificacion');
const ProyectoMiembro = require('../models/ProyectoMiembro');

// Función helper para crear notificación y emitirla por socket
const crearNotificacion = async (io, { titulo, mensaje, tipo, usuarioId, proyectoId }) => {
  try {
    const notificacion = await Notificacion.create({
      titulo,
      mensaje,
      tipo,
      usuarioId,
      proyectoId
    });

    // Emitir notificación en tiempo real al usuario específico
    if (io) {
      io.to(`usuario_${usuarioId}`).emit('nuevaNotificacion', notificacion);
    }

    return notificacion;
  } catch (error) {
    console.error('Error creando notificación:', error);
  }
};

// Notificar a todos los miembros de un proyecto
const notificarMiembros = async (io, proyectoId, { titulo, mensaje, tipo, excluirUsuarioId }) => {
  try {
    if (!proyectoId) return;
    const ProyectoMiembro = require('../models/ProyectoMiembro');
    const miembros = await ProyectoMiembro.findAll({ where: { proyectoId } });
    for (const miembro of miembros) {
      if (miembro.usuarioId !== parseInt(excluirUsuarioId)) {
        await crearNotificacion(io, {
          titulo,
          mensaje,
          tipo,
          usuarioId: miembro.usuarioId,
          proyectoId
        });
      }
    }
  } catch (error) {
    console.error('Error notificando miembros:', error);
  }
};

// OBTENER NOTIFICACIONES DEL USUARIO
const obtenerNotificaciones = async (req, res) => {
  try {
    const notificaciones = await Notificacion.findAll({
      where: { usuarioId: req.usuario.id },
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    res.json(notificaciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

// MARCAR COMO LEÍDA
const marcarLeida = async (req, res) => {
  try {
    const notificacion = await Notificacion.findByPk(req.params.id);
    if (!notificacion || notificacion.usuarioId !== req.usuario.id) {
      return res.status(404).json({ mensaje: 'Notificación no encontrada' });
    }
    await notificacion.update({ leida: true });
    res.json({ mensaje: 'Notificación marcada como leída' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

// MARCAR TODAS COMO LEÍDAS
const marcarTodasLeidas = async (req, res) => {
  try {
    await Notificacion.update(
      { leida: true },
      { where: { usuarioId: req.usuario.id } }
    );
    res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

// CONTAR NO LEÍDAS
const contarNoLeidas = async (req, res) => {
  try {
    const count = await Notificacion.count({
      where: { usuarioId: req.usuario.id, leida: false }
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

module.exports = {
  crearNotificacion,
  notificarMiembros,
  obtenerNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
  contarNoLeidas
};