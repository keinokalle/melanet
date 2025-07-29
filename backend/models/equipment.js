const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../util/db')

class Equipment extends Model {}

Equipment.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name:{
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('kayak', 'canoe', 'paddle', 'other'),
    allowNull: false
  },
  length: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  maxWeight: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  yearBought: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  clubId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'clubs', key: 'id' },
  }
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: 'equipment'
})

module.exports = Equipment