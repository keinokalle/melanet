const bcrypt = require('bcrypt')
const router = require('express').Router()
const { info: logInfo, error: logError } = require('../util/logger')
const { User } = require('../models')
const { tokenExtractor, isSuperAdmin } = require('../util/middlevare')

const userFinder = async (req, res, next) => {
  req.user = await User.findByPk(req.params.id)
  next()
}

// Superadmin only (tokenExtractor, isSuperAdmin,)
router.get('/', async (req, res) => {
  const users = await User.findAll()
  logInfo('GET /api/users')
  logInfo('Users retrieved:', JSON.stringify(users, null, 2))
  res.json(users)
})

// Superadmin only
router.get('/:id', userFinder, async (req, res) => {
  if (req.user) {
    logInfo('User retrieved:', req.user.toJSON())
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
  const passwordhash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordhash,
    email,
  })

  try{
    const savedUser = await user.save()
    res.status(201).json(savedUser)
  } catch (error) {
    next(error)
  }
})

// Superadmin only
router.put('/:id', userFinder, async (req, res) => {
  if (req.user) {
    Object.assign(req.user, req.body)
    await req.user.save()
    res.json(req.user)
  } else {
    res.status(404).end()
  }
})

// Admin only
router.delete('/:id', userFinder, tokenExtractor, isSuperAdmin, async (req, res) => {
  if (req.user) {
    await req.user.destroy()
    res.status(204).end()
  } else {
    res.status(404).end()
  }
})

module.exports = router