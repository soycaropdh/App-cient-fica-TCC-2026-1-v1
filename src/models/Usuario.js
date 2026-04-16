const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('coordinador', 'investigador_principal', 'coinvestigador'),
    defaultValue: 'coinvestigador'
  }
}, {
  tableName: 'usuarios',
  timestamps: true
});

module.exports = Usuario;