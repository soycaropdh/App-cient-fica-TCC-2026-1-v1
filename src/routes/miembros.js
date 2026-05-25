const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const {
  unirseProyecto,
  vincularUsuario,
  obtenerMiembros,
  salirProyecto,
  eliminarMiembro
} = require('../controllers/miembroController');

router.post('/unirse', verificarToken, unirseProyecto);
router.post('/vincular', verificarToken, vincularUsuario);
router.get('/:proyectoId', verificarToken, obtenerMiembros);
router.delete('/salir/:proyectoId', verificarToken, salirProyecto);
router.delete('/:proyectoId/usuario/:usuarioId', verificarToken, eliminarMiembro);

module.exports = router;