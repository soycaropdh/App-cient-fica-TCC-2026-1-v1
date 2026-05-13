const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const {
  upload,
  subirDocumento,
  obtenerDocumentos,
  obtenerDocumento,
  descargarDocumento,
  eliminarDocumento
} = require('../controllers/documentoController');

router.post('/', verificarToken, upload.single('archivo'), subirDocumento);
router.get('/proyecto/:proyectoId', verificarToken, obtenerDocumentos);
router.get('/:id', verificarToken, obtenerDocumento);
router.get('/:id/descargar', verificarToken, descargarDocumento);
router.delete('/:id', verificarToken, eliminarDocumento);

module.exports = router;