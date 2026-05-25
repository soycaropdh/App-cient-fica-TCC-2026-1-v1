const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Tarea = sequelize.define('Tarea', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'en_progreso', 'completada'),
    defaultValue: 'pendiente'
  },
  prioridad: {
    type: DataTypes.ENUM('baja', 'media', 'alta'),
    defaultValue: 'media'
  },
  fechaVencimiento: {
    type: DataTypes.DATEONLY
  },
  proyectoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  responsableId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'tareas',
  timestamps: true
});

// Esta relación se define en config.js
module.exports = Tarea;