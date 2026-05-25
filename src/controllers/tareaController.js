const Tarea = require('../models/Tarea');
const Proyecto = require('../models/Proyecto');
const Usuario = require('../models/Usuario');
const { crearNotificacion } = require('./notificacionController');
const ProyectoMiembro = require('../models/ProyectoMiembro');

let io;
const setIo = (socketIo) => { io = socketIo; };

// CREAR TAREA
const crearTarea = async (req, res) => {
  try {
    const { titulo, descripcion, prioridad, fechaVencimiento, responsableId, proyectoId } = req.body;

    // Verificar que el proyecto existe
    const proyecto = await Proyecto.findByPk(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    // Solo coordinador del proyecto o admin puede crear tareas
   const esMiembroCoordinador = await ProyectoMiembro.findOne({ 
    where: { proyectoId, usuarioId: req.usuario.id, rol: 'coordinador' } 
  });

  if (req.usuario.rol !== 'admin' && proyecto.coordinadorId !== req.usuario.id && !esMiembroCoordinador) {
    return res.status(403).json({ mensaje: 'No tienes permisos para crear tareas en este proyecto' });
  }

    const tarea = await Tarea.create({
      titulo,
      descripcion,
      prioridad,
      fechaVencimiento,
      responsableId,
      proyectoId
    });

    // Notificar al responsable
  await crearNotificacion(io, {
    titulo: '📋 Nueva tarea asignada',
    mensaje: `Se te asignó la tarea "${titulo}" en el proyecto`,
    tipo: 'nueva_tarea',
    usuarioId: responsableId,
    proyectoId
  });
  res.status(201).json({ mensaje: 'Tarea creada exitosamente', tarea });

    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// OBTENER TAREAS DE UN PROYECTO
const obtenerTareas = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    const Documento = require('../models/Documento');
    const tareas = await Tarea.findAll({
      where: { proyectoId },
      include: [
        { model: Usuario, as: 'responsable', attributes: ['id', 'nombre', 'email'] },
        { model: Documento, as: 'documentos', attributes: ['id', 'nombre', 'ruta', 'tipo', 'tamanio'] }
      ]
    });
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// OBTENER UNA TAREA
const obtenerTarea = async (req, res) => {
  try {
    const tarea = await Tarea.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'responsable', attributes: ['id', 'nombre', 'email'] },
        { model: Proyecto, as: 'proyecto', attributes: ['id', 'titulo'] }
      ]
    });

    if (!tarea) {
      return res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }

    res.json(tarea);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// EDITAR TAREA
const editarTarea = async (req, res) => {
  try {
    const tarea = await Tarea.findByPk(req.params.id);
    if (!tarea) {
      return res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }

    const proyecto = await Proyecto.findByPk(tarea.proyectoId);

    // Solo coordinador del proyecto, responsable de la tarea o admin
    if (
      req.usuario.rol !== 'admin' &&
      proyecto.coordinadorId !== req.usuario.id &&
      tarea.responsableId !== req.usuario.id
    ) {
      return res.status(403).json({ mensaje: 'No tienes permisos para editar esta tarea' });
    }

    await tarea.update(req.body);
    res.json({ mensaje: 'Tarea actualizada exitosamente', tarea });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// CAMBIAR ESTADO DE TAREA
const cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const tarea = await Tarea.findByPk(req.params.id);

    if (!tarea) {
      return res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }

    if (
      req.usuario.rol !== 'admin' &&
      tarea.responsableId !== req.usuario.id
    ) {
      return res.status(403).json({ mensaje: 'No tienes permisos para cambiar el estado' });
    }

    await tarea.update({ estado });
    res.json({ mensaje: 'Estado actualizado exitosamente', tarea });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// ELIMINAR TAREA
const eliminarTarea = async (req, res) => {
  try {
    const tarea = await Tarea.findByPk(req.params.id);
    if (!tarea) {
      return res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }

    const proyecto = await Proyecto.findByPk(tarea.proyectoId);

    if (req.usuario.rol !== 'admin' && proyecto.coordinadorId !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para eliminar esta tarea' });
    }

    await tarea.destroy();
    res.json({ mensaje: 'Tarea eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

module.exports = {
  setIo,
  crearTarea,
  obtenerTareas,
  obtenerTarea,
  editarTarea,
  cambiarEstado,
  eliminarTarea
};