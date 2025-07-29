const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../util/db')

class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: {
        args: [3, 20],
        msg: 'username must be between 3 and 20 characters long'
      }
    }
  },
  passwordhash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  language: {
    type: DataTypes.STRING
  },
  profilepicture: {
    type: DataTypes.TEXT
  }
}, {
  sequelize,
  underscored: true,
  timestamps: false,
  modelName: 'user'
})

module.exports = User

/**
Future considerations:

email: {
  type: DataTypes.STRING,
  unique: true,
  allowNull: false,
  validate: {
    isEmail: true
  }
},

lastLogin: {
  type: DataTypes.DATE
},

loginCount: {
  type: DataTypes.INTEGER,
  defaultValue: 0
},

emailVerified: {
  type: DataTypes.BOOLEAN,
  defaultValue: false
},

emailVerificationToken: {
  type: DataTypes.STRING,
  allowNull: true
},

preferences: {
  type: DataTypes.JSON,
  defaultValue: {}
},

...

*/