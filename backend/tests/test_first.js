const assert = require('node:assert')
const { test, beforeEach, describe, after } = require('node:test')
const { connectToDatabase, sequelize } = require('../util/db')
const { User } = require('../models/index')
const supertest = require('supertest')
const app = require('../index')
const helper = require('./testHelper')
const { info: logInfo, error: logError } = require('../util/logger')

const api = supertest(app)

let testTokenSuperadmin
let testToken

/*
To be continued... first developing the frontend.
*/

beforeEach(async () => { 
  // Regenerate the database before each test
  
  await User.destroy({where: {}})
  for (const user of helper.initialUsers) { await User.create(user) }

  const superadmin = {
    username: 'superadmin',
    name: 'president',
    password: 'password123',
    email: 'superadmin@example.com',
    isSuperadmin: true,
  }

  const normalUser = {
    username: 'normaluser',
    name: 'normaluser',
    password: 'password123',
    email: 'normaluser@example.com',
    isSuperadmin: false,
  }

  await api.post('/api/users').send(superadmin)
  await api.post('/api/users').send(normalUser)
  // Login to get token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'superadmin',
      password: 'password123',
    })
    .expect(200)
  
  const loginResponseNormal = await api
    .post('/api/login')
    .send({
      username: 'normaluser',
      password: 'password123',
    })
    .expect(200)

  testTokenSuperadmin = loginResponse.body.token
  testTokenNormal = loginResponseNormal.body.token
})

describe('Users tests', () => {
  test('POST /api/users create new user is successful', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = {
      username: 'newuser',
      password: 'newpassword',
      name: 'New User',
      email: 'newuser@example.com',
      isSuperadmin: true,
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    // Check that the user was created
    assert.strictEqual(response.body.username, newUser.username)

    // Get users after creation
    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
  })

  test('POST /api/users fails if email is already taken', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = {
      username: 'uniqueusername',
      password: 'somepassword',
      name: 'Duplicate Email User',
      email: 'normaluser@example.com' // already exists in initialUsers
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400) // Expecting bad request due to duplicate email
    
      // Ensure no new user was added
    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('POST /api/users fails if username is already taken', async () => { 
    const usersAtStart = await helper.usersInDb()
    const newUser = {
      username: 'superadmin',
      password: 'somepassword',
      name: 'Wannabe admin',
      email: 'wannabe@example.com'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(400) // Expecting bad request due to duplicate username
    
      // Ensure no new user was added
    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('GET /api/users returns all users if superadmin', async () => {
    const usersAtStart = await helper.usersInDb()
    const response = await api
      .get('/api/users')
      .set('Authorization', `Bearer ${testTokenSuperadmin}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, usersAtStart.length)

    const responseFail = await api
      .get('/api/users')
      .set('Authorization', `Bearer ${testTokenNormal}`)
      .expect(401)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(responseFail.body.error, 'unauthorized')
  })

  test('GET /api/memberships/club/:clubId returns all memberships by club id', async () => {
    const response = await api
      .get('/api/memberships/club/1')
      .set('Authorization', `Bearer ${testTokenSuperadmin}`)
      .expect(200)
    
    assert.strictEqual(response.body.length, 2)
  })
})

after(async () => {
  try {
    await sequelize.close()
    logInfo('Database connection closed')
  } catch (dbError) {
    logError('Error closing database:', dbError)
  }
}) 
