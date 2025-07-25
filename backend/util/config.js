require('dotenv').config()
/*
 * This file is used to store the configuration for the backend.
*/
module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  SECRET: process.env.SECRET,
  PORT: process.env.PORT || 3001,
}