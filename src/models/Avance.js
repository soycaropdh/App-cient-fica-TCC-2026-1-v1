const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Avance = sequelize.define('Avance', {
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
    type: DataTypes.TEXT,
    allowNull: false
  },
  porcentaje: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  tipo: {
    type: DataTypes.ENUM('informe_parcial', 'entregable', 'resultado'),
    defaultValue: 'informe_parcial'
  },
  proyectoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  autorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'avances',
  timestamps: true
});

module.exports = Avance;