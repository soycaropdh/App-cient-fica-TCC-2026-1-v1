const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Notificacion = sequelize.define('Notificacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM(
      'nuevo_miembro',
      'vinculado_proyecto',
      'nuevo_documento',
      'nuevo_mensaje',
      'nueva_tarea'
    ),
    allowNull: false
  },
  leida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  proyectoId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'notificaciones',
  timestamps: true
});

module.exports = Notificacion;