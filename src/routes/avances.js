const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const {
  crearAvance,
  obtenerAvances,
  obtenerAvance,
  editarAvance,
  eliminarAvance
} = require('../controllers/avanceController');

router.post('/', verificarToken, crearAvance);
router.get('/proyecto/:proyectoId', verificarToken, obtenerAvances);
router.get('/:id', verificarToken, obtenerAvance);
router.put('/:id', verificarToken, editarAvance);
router.delete('/:id', verificarToken, eliminarAvance);

module.exports = router;