const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = require('express').Router()
const { requestLogger } = require('../util/middlevare')
const { info: logInfo, error: logError } = require('../util/logger')
const { SECRET } = require('../util/config')
const User = require('../models/user')

router.post('/', requestLogger, async (request, response) => {
  const body = request.body

  if(!body.username || !body.password) {
    return response.status(400).json({
      error: 'username and password are required'
    })
  }

  logInfo('Login attempt for username:', body.username)

  const user = await User.findOne({
    where: {
      username: body.username
    }
  })

  logInfo('User found:', user ? 'Yes' : 'No')

  if (!body.password) {
    return response.status(400).json({
      error: 'password is required'
    })
  }
  logInfo('Password provided:', body.password)
  logInfo('Stored password hash:', user.passwordhash)

  const passwordCorrect =
    user === null ? false : await bcrypt.compare(body.password, user.passwordhash)

  if (!passwordCorrect) {
    logError('Invalid login attempt for username:', body.username)
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  }

  const token = jwt.sign(userForToken, SECRET, {
    expiresIn: 60*60*24, // 1 day
  })

  logInfo('Successful login for user:', user.username)
  response
    .status(200)
    .send({ token, username: user.username, name: user.name, id: user.id })
})

module.exports = router