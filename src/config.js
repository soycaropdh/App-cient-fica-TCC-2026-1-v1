const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
);

const conectarDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL exitosa');

    // Importar modelos
    const Usuario = require('./models/Usuario');
    const Proyecto = require('./models/Proyecto');
    const Tarea = require('./models/Tarea');
    const Avance = require('./models/Avance');
    const Documento = require('./models/Documento');
    const Mensaje = require('./models/Mensaje');

    // Relaciones
    // Usuario - Proyecto
    Usuario.hasMany(Proyecto, { foreignKey: 'coordinadorId', as: 'proyectosCoordinados' });
    Proyecto.belongsTo(Usuario, { foreignKey: 'coordinadorId', as: 'coordinador' });

    // Proyecto - Tarea
    Proyecto.hasMany(Tarea, { foreignKey: 'proyectoId', as: 'tareas' });
    Tarea.belongsTo(Proyecto, { foreignKey: 'proyectoId', as: 'proyecto' });

    // Usuario - Tarea
    Usuario.hasMany(Tarea, { foreignKey: 'responsableId', as: 'tareasAsignadas' });
    Tarea.belongsTo(Usuario, { foreignKey: 'responsableId', as: 'responsable' });

    // Proyecto - Avance
    Proyecto.hasMany(Avance, { foreignKey: 'proyectoId', as: 'avances' });
    Avance.belongsTo(Proyecto, { foreignKey: 'proyectoId', as: 'proyecto' });

    // Usuario - Avance
    Usuario.hasMany(Avance, { foreignKey: 'autorId', as: 'avancesRegistrados' });
    Avance.belongsTo(Usuario, { foreignKey: 'autorId', as: 'autor' });

    // Proyecto - Documento
    Proyecto.hasMany(Documento, { foreignKey: 'proyectoId', as: 'documentos' });
    Documento.belongsTo(Proyecto, { foreignKey: 'proyectoId', as: 'proyecto' });

    // Usuario - Documento
    Usuario.hasMany(Documento, { foreignKey: 'autorId', as: 'documentosSubidos' });
    Documento.belongsTo(Usuario, { foreignKey: 'autorId', as: 'autor' });

    // Usuario - Mensaje
    Usuario.hasMany(Mensaje, { foreignKey: 'autorId', as: 'mensajesEnviados' });
    Mensaje.belongsTo(Usuario, { foreignKey: 'autorId', as: 'autor' });

    await sequelize.sync({ alter: true });
    console.log('✅ Tablas sincronizadas');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
  }
};

module.exports = { sequelize, conectarDB };