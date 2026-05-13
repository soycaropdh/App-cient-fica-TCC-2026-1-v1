const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const {
  crearProyecto,
  obtenerProyectos,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  cambiarEstado
} = require('../controllers/proyectoController');

// Todas las rutas requieren token
router.post('/', verificarToken, crearProyecto);
router.get('/', verificarToken, obtenerProyectos);
router.get('/:id', verificarToken, obtenerProyecto);
router.put('/:id', verificarToken, editarProyecto);
router.delete('/:id', verificarToken, eliminarProyecto);
router.patch('/:id/estado', verificarToken, cambiarEstado);

module.exports = router;