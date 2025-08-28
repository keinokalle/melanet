const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../util/db')

class Reservation extends Model {}

Reservation.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  equipmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'equipment', key: 'id' }
  },
  clubId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'clubs', key: 'id' }
  },
  detail: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: 'reservation'
})

module.exports = Reservation
