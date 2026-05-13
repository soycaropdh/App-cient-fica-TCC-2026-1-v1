const Proyecto = require('../models/Proyecto');
const Usuario = require('../models/Usuario');
const Tarea = require('../models/Tarea');
const Avance = require('../models/Avance');

// CREAR PROYECTO
const crearProyecto = async (req, res) => {
  try {
    const { titulo, descripcion, objetivos, presupuesto, fechaInicio, fechaFin } = req.body;

    const proyecto = await Proyecto.create({
      titulo,
      descripcion,
      objetivos,
      presupuesto,
      fechaInicio,
      fechaFin,
      coordinadorId: req.usuario.id
    });

    res.status(201).json({ mensaje: 'Proyecto creado exitosamente', proyecto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// OBTENER TODOS LOS PROYECTOS
const obtenerProyectos = async (req, res) => {
  try {
    const proyectos = await Proyecto.findAll({
      include: [
        { model: Usuario, as: 'coordinador', attributes: ['id', 'nombre', 'email'] },
        { model: Tarea, as: 'tareas' },
        { model: Avance, as: 'avances' }
      ]
    });
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// OBTENER UN PROYECTO
const obtenerProyecto = async (req, res) => {
  try {
    const proyecto = await Proyecto.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'coordinador', attributes: ['id', 'nombre', 'email'] },
        { model: Tarea, as: 'tareas' },
        { model: Avance, as: 'avances' }
      ]
    });

    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    res.json(proyecto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// EDITAR PROYECTO (solo coordinador del proyecto o admin)
const editarProyecto = async (req, res) => {
  try {
    const proyecto = await Proyecto.findByPk(req.params.id);

    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    // Verificar permisos
    if (req.usuario.rol !== 'admin' && proyecto.coordinadorId !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para editar este proyecto' });
    }

    await proyecto.update(req.body);
    res.json({ mensaje: 'Proyecto actualizado exitosamente', proyecto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// ELIMINAR PROYECTO (solo coordinador del proyecto o admin)
const eliminarProyecto = async (req, res) => {
  try {
    const proyecto = await Proyecto.findByPk(req.params.id);

    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    if (req.usuario.rol !== 'admin' && proyecto.coordinadorId !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para eliminar este proyecto' });
    }

    await proyecto.destroy();
    res.json({ mensaje: 'Proyecto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// CAMBIAR ESTADO DEL PROYECTO
const cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const proyecto = await Proyecto.findByPk(req.params.id);

    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    if (req.usuario.rol !== 'admin' && proyecto.coordinadorId !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para cambiar el estado' });
    }

    await proyecto.update({ estado });
    res.json({ mensaje: 'Estado actualizado exitosamente', proyecto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

module.exports = {
  crearProyecto,
  obtenerProyectos,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  cambiarEstado
};