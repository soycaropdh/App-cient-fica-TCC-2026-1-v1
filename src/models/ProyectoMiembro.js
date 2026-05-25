const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const ProyectoMiembro = sequelize.define('ProyectoMiembro', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  proyectoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('coordinador', 'investigador_principal', 'coinvestigador'),
    defaultValue: 'coinvestigador'
  }
}, {
  tableName: 'proyecto_miembros',
  timestamps: true
});

module.exports = ProyectoMiembro;