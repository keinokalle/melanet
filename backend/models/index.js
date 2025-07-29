const User = require('./user')
const Club = require('./club')
const Equipment = require('./equipment')
const Membership = require('./membership')
const Paddle = require('./paddle')
/*
* This file is mainly used for exporting the models all at once
* instead of importing them one by one.
*/
Club.hasMany(Equipment)
Equipment.belongsTo(Club)

Paddle.belongsTo(User)
Paddle.belongsTo(Club)
Paddle.belongsTo(Equipment)

User.belongsToMany(Club, { through: Membership })
Club.belongsToMany(User, { through: Membership })


module.exports = {
  User,
  Club,
  Equipment,
  Membership,
  Paddle
}