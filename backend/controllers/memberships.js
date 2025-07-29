const router = require('express').Router()
const { Membership } = require('../models')

// Get all memberships
router.get('/', async (req, res) => {
  const memberships = await Membership.findAll()
  res.json(memberships)
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

// Create a new membership
router.post('/', async (req, res) => {
  const { user_id, club_id } = req.body
  if (!user_id || !club_id) {
    return res.status(400).json({ error: 'user_id and club_id are required' })
  }
  try {
    const membership = await Membership.create({ user_id, club_id })
    res.status(201).json(membership)
  } catch (error) {
    res.status(400).json({ error: error.message })
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
