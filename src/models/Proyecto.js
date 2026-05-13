const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Proyecto = sequelize.define('Proyecto', {
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
  objetivos: {
    type: DataTypes.TEXT
  },
  presupuesto: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  estado: {
    type: DataTypes.ENUM('planeacion', 'ejecucion', 'finalizado'),
    defaultValue: 'planeacion'
  },
  fechaInicio: {
    type: DataTypes.DATEONLY
  },
  fechaFin: {
    type: DataTypes.DATEONLY
  },
  coordinadorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'proyectos',
  timestamps: true
});

module.exports = Proyecto;