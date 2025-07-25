const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../util/db')

class Club extends Model {}

Club.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  location: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING
  }
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: 'club'
})

module.exports = Club