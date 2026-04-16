const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
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

// Rutas
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor TCC funcionando correctamente' });
});

// Socket.io
setupSocket(io);

const PORT = process.env.PORT || 3000;

// Conectar base de datos y arrancar servidor
conectarDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
});
