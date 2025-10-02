const Sequelize = require('sequelize')
const { DATABASE_URL } = require('./config')
const { Umzug, SequelizeStorage } = require('umzug')
const { info: logInfo, error: logError } = require('./logger')

/**
 * This file is used to connect to the database when the backend starts.
 */


const sequelize = new Sequelize(DATABASE_URL, {
  logging: false
})

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate()
    await runMigrations()
    logInfo('Database connected')
  } catch (err) {
    logError('Connecting database failed:', err.message)
    return process.exit(1)
  }

  return null
}

const migrationConf = {
  migrations: {
    glob: 'migrations/*.js',
  },
  storage: new SequelizeStorage({ sequelize, tableName: 'migrations' }),
  context: sequelize.getQueryInterface(),
  logger: console,
}

const runMigrations = async () => {
  const migrator = new Umzug(migrationConf)
  const migrations = await migrator.up()
  logInfo('Migrations up to date', {
    files: migrations.map((mig) => mig.name),
  })
}

const rollbackMigration = async () => {
  await sequelize.authenticate()
  const migrator = new Umzug(migrationConf)
  await migrator.down()
}

module.exports = { connectToDatabase, sequelize, rollbackMigration }