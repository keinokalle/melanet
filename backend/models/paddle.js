const { Model, DataTypes } = require('sequelize')
const { sequelize } = require('../util/db')

class Paddle extends Model {}

Paddle.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  ended: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  info: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  clubId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clubs',
      key: 'id'
    }
  },
  equipmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipment',
      key: 'id'
    }
  }
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: 'paddle'
})

module.exports = Paddle
