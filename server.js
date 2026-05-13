const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const proyectoRoutes = require('./src/routes/proyectos');
const tareaRoutes = require('./src/routes/tareas');
const avanceRoutes = require('./src/routes/avances');
const documentoRoutes = require('./src/routes/documentos');
const setupSocket = require('./src/socket/chat');
const { conectarDB } = require('./src/config');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api/avances', avanceRoutes);
app.use('/api/documentos', documentoRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor TCC funcionando correctamente' });
});

// Socket.io
setupSocket(io);

const PORT = process.env.PORT || 3000;

// Crear admin por defecto si no existe
const crearAdminPorDefecto = async () => {
  const Usuario = require('./src/models/Usuario');
  const adminExiste = await Usuario.findOne({ where: { rol: 'admin' } });
  if (!adminExiste) {
    const passwordEncriptada = await bcrypt.hash('admin123', 10);
    await Usuario.create({
      nombre: 'Administrador',
      email: 'admin@tcc.com',
      password: passwordEncriptada,
      rol: 'admin',
      activo: true
    });
    console.log(' Admin creado: admin@tcc.com / admin123');
  }
};

// Conectar base de datos y arrancar servidor
conectarDB().then(async () => {
  await crearAdminPorDefecto();
  server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});
