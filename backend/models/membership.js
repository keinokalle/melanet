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
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    underscored: true,
    modelName: 'Membership',
    tableName: 'memberships',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['clubId', 'userId']
      }
    ]
  }
)

module.exports = Membership;
