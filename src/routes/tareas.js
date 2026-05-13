const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const {
  crearTarea,
  obtenerTareas,
  obtenerTarea,
  editarTarea,
  cambiarEstado,
  eliminarTarea
} = require('../controllers/tareaController');

router.post('/', verificarToken, crearTarea);
router.get('/proyecto/:proyectoId', verificarToken, obtenerTareas);
router.get('/:id', verificarToken, obtenerTarea);
router.put('/:id', verificarToken, editarTarea);
router.patch('/:id/estado', verificarToken, cambiarEstado);
router.delete('/:id', verificarToken, eliminarTarea);

module.exports = router;