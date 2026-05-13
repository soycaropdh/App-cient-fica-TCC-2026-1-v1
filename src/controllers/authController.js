const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// REGISTRO
const registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // No permitir registro como admin
    if (rol === 'admin') {
      return res.status(403).json({ mensaje: 'No puedes registrarte como administrador' });
    }

    const usuarioExiste = await Usuario.findOne({ where: { email } });
    if (usuarioExiste) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }

    const passwordEncriptada = await bcrypt.hash(password, 10);

    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password: passwordEncriptada,
      rol: rol || 'coinvestigador'
    });

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Credenciales incorrectas' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Usuario desactivado, contacta al administrador' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(400).json({ mensaje: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// OBTENER TODOS LOS USUARIOS (solo admin)
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'rol', 'activo', 'createdAt']
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

// OBTENER UN USUARIO
const obtenerUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: ['id', 'nombre', 'email', 'rol', 'activo', 'createdAt']
    });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

// EDITAR USUARIO (admin edita cualquiera, usuario edita solo sus datos)
const editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo } = req.body;
    const usuarioSolicitante = req.usuario;

    // Verificar permisos
    if (usuarioSolicitante.rol !== 'admin' && usuarioSolicitante.id !== parseInt(id)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para editar este usuario' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Usuario normal solo puede cambiar nombre y email
    if (usuarioSolicitante.rol !== 'admin') {
      await usuario.update({ nombre, email });
    } else {
      // Admin puede cambiar todo
      await usuario.update({ nombre, email, rol, activo });
    }

    res.json({ mensaje: 'Usuario actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// ELIMINAR USUARIO (solo admin)
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Solo el administrador puede eliminar usuarios' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    await usuario.destroy();
    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};

module.exports = {
  registrar,
  login,
  obtenerUsuarios,
  obtenerUsuario,
  editarUsuario,
  eliminarUsuario
};