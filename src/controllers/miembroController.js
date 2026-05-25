const ProyectoMiembro = require('../models/ProyectoMiembro');
const Proyecto = require('../models/Proyecto');
const Usuario = require('../models/Usuario');
const { crearNotificacion } = require('./notificacionController');

let io;
const setIo = (socketIo) => { io = socketIo; };

// UNIRSE A UN PROYECTO
const unirseProyecto = async (req, res) => {
  try {
    const { proyectoId } = req.body;
    const usuarioId = req.usuario.id;
    const rolUsuario = req.usuario.rol;

    const proyecto = await Proyecto.findByPk(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    const yaEsMiembro = await ProyectoMiembro.findOne({ where: { proyectoId, usuarioId } });
    if (yaEsMiembro) {
      return res.status(400).json({ mensaje: 'Ya eres miembro de este proyecto' });
    }

    const miembros = await ProyectoMiembro.findAll({ where: { proyectoId } });

    if (rolUsuario === 'coordinador') {
      const coordinadores = miembros.filter(m => m.rol === 'coordinador');
      if (coordinadores.length >= 1) {
        return res.status(400).json({ mensaje: 'Este proyecto ya tiene un coordinador' });
      }
    }

    if (rolUsuario === 'investigador_principal') {
      const investigadores = miembros.filter(m => m.rol === 'investigador_principal');
      if (investigadores.length >= 1) {
        return res.status(400).json({ mensaje: 'Este proyecto ya tiene un investigador principal' });
      }
    }

    const miembro = await ProyectoMiembro.create({ proyectoId, usuarioId, rol: rolUsuario });

    // Notificar al coordinador del proyecto
    const usuario = await Usuario.findByPk(usuarioId);
    await crearNotificacion(io, {
      titulo: '👥 Nuevo miembro',
      mensaje: `${usuario.nombre} se ha unido a tu proyecto "${proyecto.titulo}"`,
      tipo: 'nuevo_miembro',
      usuarioId: proyecto.coordinadorId,
      proyectoId
    });

    res.status(201).json({ mensaje: 'Te has unido al proyecto exitosamente', miembro });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// VINCULAR USUARIO A PROYECTO (coordinador vincula a alguien)
const vincularUsuario = async (req, res) => {
  try {
    const { proyectoId, usuarioId } = req.body;

    const proyecto = await Proyecto.findByPk(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    // Solo coordinador del proyecto o admin puede vincular
    if (req.usuario.rol !== 'admin' && proyecto.coordinadorId !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para vincular usuarios' });
    }

    const yaEsMiembro = await ProyectoMiembro.findOne({ where: { proyectoId, usuarioId } });
    if (yaEsMiembro) {
      return res.status(400).json({ mensaje: 'El usuario ya es miembro de este proyecto' });
    }

    const usuarioAVincular = await Usuario.findByPk(usuarioId);
    if (!usuarioAVincular) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const miembros = await ProyectoMiembro.findAll({ where: { proyectoId } });

    if (usuarioAVincular.rol === 'coordinador') {
      const coordinadores = miembros.filter(m => m.rol === 'coordinador');
      if (coordinadores.length >= 1) {
        return res.status(400).json({ mensaje: 'Este proyecto ya tiene un coordinador' });
      }
    }

    if (usuarioAVincular.rol === 'investigador_principal') {
      const investigadores = miembros.filter(m => m.rol === 'investigador_principal');
      if (investigadores.length >= 1) {
        return res.status(400).json({ mensaje: 'Este proyecto ya tiene un investigador principal' });
      }
    }

    const miembro = await ProyectoMiembro.create({
      proyectoId,
      usuarioId,
      rol: usuarioAVincular.rol
    });

    // Notificar al usuario vinculado
    await crearNotificacion(io, {
      titulo: '🔬 Vinculado a proyecto',
      mensaje: `Has sido vinculado al proyecto "${proyecto.titulo}"`,
      tipo: 'vinculado_proyecto',
      usuarioId,
      proyectoId
    });

    res.status(201).json({ mensaje: 'Usuario vinculado exitosamente', miembro });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// OBTENER MIEMBROS DE UN PROYECTO
const obtenerMiembros = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    const miembros = await ProyectoMiembro.findAll({
      where: { proyectoId },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email', 'rol'] }
      ]
    });
    res.json(miembros);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// SALIR DE UN PROYECTO
const salirProyecto = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    const usuarioId = req.usuario.id;

    const miembro = await ProyectoMiembro.findOne({ where: { proyectoId, usuarioId } });
    if (!miembro) {
      return res.status(404).json({ mensaje: 'No eres miembro de este proyecto' });
    }

    await miembro.destroy();
    res.json({ mensaje: 'Has salido del proyecto exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// ELIMINAR MIEMBRO (solo coordinador o admin)
const eliminarMiembro = async (req, res) => {
  try {
    const { proyectoId, usuarioId } = req.params;

    const proyecto = await Proyecto.findByPk(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    if (req.usuario.rol !== 'admin' && proyecto.coordinadorId !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para eliminar miembros' });
    }

    const miembro = await ProyectoMiembro.findOne({ where: { proyectoId, usuarioId } });
    if (!miembro) {
      return res.status(404).json({ mensaje: 'El usuario no es miembro de este proyecto' });
    }

    await miembro.destroy();
    res.json({ mensaje: 'Miembro eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

module.exports = {
  setIo,
  unirseProyecto,
  vincularUsuario,
  obtenerMiembros,
  salirProyecto,
  eliminarMiembro
};