const User = require('./user')
const Club = require('./club')
const Equipment = require('./equipment')
const Membership = require('./membership')
const Paddle = require('./paddle')
const Reservation = require('./reservation')
/*
* This file is mainly used for exporting the models all at once
* instead of importing them one by one.
*/
Club.hasMany(Equipment)
Equipment.belongsTo(Club)

User.hasMany(Paddle)
Paddle.belongsTo(User)

Club.hasMany(Paddle)
Paddle.belongsTo(Club)

Equipment.hasMany(Paddle)
Paddle.belongsTo(Equipment)

Membership.belongsTo(User)
Membership.belongsTo(Club)
User.belongsToMany(Club, { through: Membership })
Club.belongsToMany(User, { through: Membership })

Reservation.belongsTo(User)
Reservation.belongsTo(Equipment)
Reservation.belongsTo(Club)


module.exports = {
  User,
  Club,
  Equipment,
  Membership,
  Paddle,
  Reservation
}