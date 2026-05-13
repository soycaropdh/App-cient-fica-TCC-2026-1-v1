const Avance = require('../models/Avance');
const Proyecto = require('../models/Proyecto');
const Usuario = require('../models/Usuario');

// CREAR AVANCE
const crearAvance = async (req, res) => {
  try {
    const { titulo, descripcion, porcentaje, tipo, proyectoId } = req.body;

    const proyecto = await Proyecto.findByPk(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    const avance = await Avance.create({
      titulo,
      descripcion,
      porcentaje,
      tipo,
      proyectoId,
      autorId: req.usuario.id
    });

    res.status(201).json({ mensaje: 'Avance registrado exitosamente', avance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// OBTENER AVANCES DE UN PROYECTO
const obtenerAvances = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    const avances = await Avance.findAll({
      where: { proyectoId },
      include: [
        { model: Usuario, as: 'autor', attributes: ['id', 'nombre', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(avances);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// OBTENER UN AVANCE
const obtenerAvance = async (req, res) => {
  try {
    const avance = await Avance.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'autor', attributes: ['id', 'nombre', 'email'] },
        { model: Proyecto, as: 'proyecto', attributes: ['id', 'titulo'] }
      ]
    });

    if (!avance) {
      return res.status(404).json({ mensaje: 'Avance no encontrado' });
    }

    res.json(avance);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// EDITAR AVANCE (solo autor o admin)
const editarAvance = async (req, res) => {
  try {
    const avance = await Avance.findByPk(req.params.id);
    if (!avance) {
      return res.status(404).json({ mensaje: 'Avance no encontrado' });
    }

    if (req.usuario.rol !== 'admin' && avance.autorId !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para editar este avance' });
    }

    await avance.update(req.body);
    res.json({ mensaje: 'Avance actualizado exitosamente', avance });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// ELIMINAR AVANCE (solo autor o admin)
const eliminarAvance = async (req, res) => {
  try {
    const avance = await Avance.findByPk(req.params.id);
    if (!avance) {
      return res.status(404).json({ mensaje: 'Avance no encontrado' });
    }

    if (req.usuario.rol !== 'admin' && avance.autorId !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para eliminar este avance' });
    }

    await avance.destroy();
    res.json({ mensaje: 'Avance eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

module.exports = {
  crearAvance,
  obtenerAvances,
  obtenerAvance,
  editarAvance,
  eliminarAvance
};