const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')  
const router = require('express').Router()
const { requestLogger } = require('../util/middlevare')


const { SECRET } = require('../util/config')
const User = require('../models/user')

router.post('/', requestLogger, async (request, response) => {
  const body = request.body

  console.log('Login attempt for username:', body.username)

  const user = await User.findOne({
    where: {
      username: body.username
    }
  })

  console.log('User found:', user ? 'Yes' : 'No')

  if (!body.password) {
    return response.status(400).json({
      error: 'password is required'
    })
  }
  console.log(body.password);
  console.log(user.passwordhash);

  const passwordCorrect =
    user === null ? false : await bcrypt.compare(body.password, user.passwordhash)

  if (!passwordCorrect) {
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

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = router