const { Model, DataTypes, Op } = require('sequelize')
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
    allowNull: true
  },
  length: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  info: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  additionalInfo: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  visitors: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  clubId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'clubs',
      key: 'id'
    }
  },
  equipmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'equipment',
      key: 'id'
    }
  }
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: 'paddle',
  validate: {
    async endTimeValidation() {
      if (this.endTime && this.startTime && this.endTime <= this.startTime) {
        throw new Error('End time must be after start time.');
      }
    },
    
    async equipmentAvailabilityValidation() {
      if (!this.equipmentId) return; // Skip validation if no equipment is selected
      
      // Check for overlapping paddles
      const overlappingPaddles = await Paddle.findOne({
        where: {
          equipmentId: this.equipmentId,
          id: { [Op.ne]: this.id }, // Exclude current paddle when updating
          [Op.or]: [
            {
              startTime: { [Op.between]: [this.startTime, this.endTime] }
            },
            {
              endTime: { [Op.between]: [this.startTime, this.endTime] }
            },
            {
              startTime: { [Op.lt]: this.startTime },
              endTime: { [Op.gt]: this.endTime }
            }
          ]
        }
      });

      if (overlappingPaddles) {
        throw new Error('This equipment is already in use during the specified time slot.');
      }

      // Check if equipment is currently in use (has startTime but no endTime)
      const currentlyInUse = await Paddle.findOne({
        where: {
          equipmentId: this.equipmentId,
          id: { [Op.ne]: this.id }, // Exclude current paddle when updating
          startTime: { [Op.lte]: new Date() }, // Started in the past or now
          endTime: null // No end time defined (still in use)
        }
      })

      if (currentlyInUse) {
        throw new Error('This equipment is currently in use and cannot be used in the system.');
      }
    }
  }
})

module.exports = Paddle
