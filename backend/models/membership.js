const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../util/db')

class Membership extends Model {}

Membership.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    clubId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'clubs', key: 'id' }
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'superadmin'),
      allowNull: false,
      defaultValue: 'user'
    }
  },
  {
    sequelize,
    modelName: 'Membership',
    tableName: 'memberships',
    timestamps: false
  }
);

module.exports = Membership;
