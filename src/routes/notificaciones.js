const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const {
  obtenerNotificaciones,
  marcarLeida,
  marcarTodasLeidas,
  contarNoLeidas
} = require('../controllers/notificacionController');

router.get('/', verificarToken, obtenerNotificaciones);
router.get('/no-leidas', verificarToken, contarNoLeidas);
router.put('/:id/leer', verificarToken, marcarLeida);
router.put('/leer-todas', verificarToken, marcarTodasLeidas);

module.exports = router;