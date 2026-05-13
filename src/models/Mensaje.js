const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Mensaje = sequelize.define('Mensaje', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('publico', 'privado'),
    defaultValue: 'publico'
  },
  proyectoId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  autorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  destinatarioId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'mensajes',
  timestamps: true
});

module.exports = Mensaje;