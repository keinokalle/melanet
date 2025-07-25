const User = require('./user')
const Club = require('./club')
/*
* This file is mainly used for exporting the models all at once
* instead of importing them one by one.
*/
User.sync()
Club.sync()

module.exports = {
  User,
  Club
}