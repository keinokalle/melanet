const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../index')
const { sequelize } = require('../util/db')
const { User, Membership, Club, Equipment, Paddle } = require('../models/index')
const helper = require('./testHelper')

const api = supertest(app)

let testToken = null

beforeEach(async () => {
  await sequelize.sync({ force: true })
  
  // Delete all data from all tables
  await Paddle.destroy({ where: {} })
  await Membership.destroy({ where: {} })
  await Equipment.destroy({ where: {} })
  await Club.destroy({ where: {} })
  await User.destroy({ where: {} })

  // Create example data from helper
  await User.bulkCreate(helper.initialUsers)
  await Club.bulkCreate(helper.initialClubs)
  await Equipment.bulkCreate(helper.initialEquipments)
  await Membership.bulkCreate(helper.initialMemberships)
  await Paddle.bulkCreate(helper.initialPaddles)
})


describe('User creation tests', function() {
  test('should create a new user', async () => {
    
    const usersFirst = await helper.usersInDb()
    
    const newUser = {
      username: 'kalle',
      password: 'salainen',
      name: 'Kalle Korvapuusti',
      email: 'kalle@example.com'
    }

    const response = await request(app)
      .post('/api/users')
      .send(newUser)
      .expect(201)

    assert.strictEqual(response.body.username, newUser.username)

    const userInDb = await User.findOne({ where: { username: newUser.username } })
    assert(userInDb, 'User should exist in database')

    const users = await helper.usersInDb()
    assert.strictEqual(users.length, usersFirst.length + 1)
  })
})

after(async () =>  {
  await sequelize.close()
})