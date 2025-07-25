const User = require('./user')
const Club = require('./club')
const Equipment = require('./equipment')
/*
* This file is mainly used for exporting the models all at once
* instead of importing them one by one.
*/
Club.hasMany(Equipment)
Equipment.belongsTo(Club)

User.sync({ alter: true })
Club.sync({ alter: true })
Equipment.sync({ alter: true })

module.exports = {
  User,
  Club,
  Equipment
}