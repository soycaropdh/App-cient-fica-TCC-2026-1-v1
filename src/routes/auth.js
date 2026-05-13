const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/auth');
const {
  registrar,
  login,
  obtenerUsuarios,
  obtenerUsuario,
  editarUsuario,
  eliminarUsuario
} = require('../controllers/authController');

// Rutas públicas
router.post('/register', registrar);
router.post('/login', login);

// Rutas protegidas
router.get('/usuarios', verificarToken, obtenerUsuarios);
router.get('/usuarios/:id', verificarToken, obtenerUsuario);
router.put('/usuarios/:id', verificarToken, editarUsuario);
router.delete('/usuarios/:id', verificarToken, eliminarUsuario);

module.exports = router;