const bcrypt = require('bcrypt')
const router = require('express').Router()

const { User } = require('../models')

const userFinder = async (req, res, next) => {
  req.user = await User.findByPk(req.params.id)
  next()
}

router.get('/', async (req, res) => {
  const users = await User.findAll()
  console.log('GET /api/users')
  console.log(JSON.stringify(users, null, 2))
  res.json(users)
})

// Get user by their id
router.get('/:id', userFinder, async (req, res) => {
  if (req.user) {
    console.log(req.user.toJSON())
    res.json(req.user)
  } else {
    res.status(404).end()
  }
})

// Create a new user
/**
 * This method works as well. Good if you need to 
 * modify them before saving to the database.
 * 
 * const user = User.build(req.body)
 * await user.save()
 */
router.post('/', async (req, res) => {
  const { username, name, password, email } = req.body
  
  // Validate required fields
  if (!username || !password || !email) {
    return res.status(400).json({ 
      error: 'username, password, and email are required' 
    })
  }
  
  if(password.length < 3){
    return res.status(400).json({ 
      error: 'password must be at least 3 characters long' 
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordhash: passwordHash,
    email,
  })
  console.log(user)

  try{
    const savedUser = await user.save()
    console.log(savedUser)
    res.status(201).json(savedUser)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: error.message,
      })
    }
    res.status(500).json({
      error: 'internal server error',
    })
  }
})

// Modify a user
router.put('/:id', userFinder, async (req, res) => {
  if (req.user) {
    Object.assign(req.user, req.body)
    await req.user.save()
    res.json(req.user)
  } else {
    res.status(404).end()
  }
})

// Delete a user
router.delete('/:id', userFinder, async (req, res) => {
  if (req.user) {
    await req.user.destroy()
    res.status(204).end()
  } else {
    res.status(404).end()
  }
})

module.exports = router