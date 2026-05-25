const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Documento = sequelize.define('Documento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  tipo: {
    type: DataTypes.ENUM('paper', 'encuesta', 'base_datos', 'reporte', 'otro'),
    defaultValue: 'otro'
  },
  ruta: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tamanio: {
    type: DataTypes.INTEGER
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },

tareaId: {
  type: DataTypes.INTEGER,
  allowNull: true
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
  tableName: 'documentos',
  timestamps: true
});

module.exports = Documento;