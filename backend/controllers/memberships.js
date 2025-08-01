const router = require('express').Router()
const { Membership, User, Club } = require('../models')
const { info: logInfo, error: logError } = require('../util/logger')

// Get all memberships
router.get('/', async (req, res) => {
  const memberships = await Membership.findAll()
  res.json(memberships)
})

// Get all memberships by user id
router.get('/user/:userId', async (req, res) => {
  try {
    const memberships = await Membership.findAll({
      where: { userId: req.params.userId },
      include: [{
        model: Club,
        attributes: ['id', 'name']
      }]
    })
    res.json(memberships)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get a membership by id
router.get('/:id', async (req, res) => {
  const membership = await Membership.findByPk(req.params.id)
  if (membership) {
    res.json(membership)
  } else {
    res.status(404).end()
  }
})

// Get all memberships by club id
router.get('/club/:clubId', async (req, res) => {
  try {
    const memberships = await Membership.findAll({
      where: { clubId: req.params.clubId },
      include: [{
        model: User,
        attributes: ['id', 'username', 'email']
      }]
    })
    res.json(memberships)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})


// Create a new membership
router.post('/', async (req, res) => {
  logInfo(req.body)
  const { userId, clubId } = req.body
  if (!userId || !clubId) {
    return res.status(400).json({ error: 'userId and clubId are required' })
  }
  try {
    const membership = await Membership.create({ userId, clubId })
    res.status(201).json(membership)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update a membership
router.put('/:id', async (req, res) => {
  const membership = await Membership.findByPk(req.params.id)
  if (membership) {
    membership.update(req.body)
    await membership.save()
    res.json(membership)
  } else {
    res.status(404).end()
  }
})

// Delete a membership
router.delete('/:id', async (req, res) => {
  const membership = await Membership.findByPk(req.params.id)
  if (membership) {
    await membership.destroy()
    res.status(204).end()
  } else {
    res.status(404).end()
  }
})

module.exports = router
