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
    console.log('✅ Conexión a PostgreSQL exitosa');
    await sequelize.sync({ alter: true });
    console.log('✅ Tablas sincronizadas');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
  }
};

module.exports = { sequelize, conectarDB };
