const Sequelize = require('sequelize')
const { DATABASE_URL } = require('./config')
/**
 * This file is used to connect to the database when the backend starts.
 */
const sequelize = new Sequelize(DATABASE_URL, {
  logging: false // Disable all SQL logging
})

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('database connected')
  } catch (err) {
    console.log('connecting database failed')
    return process.exit(1)
  }

  return null
}

module.exports = { connectToDatabase, sequelize }