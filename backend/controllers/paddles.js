const router = require('express').Router()
const { Paddle } = require('../models');

router.get('/', async (req, res) => {
  const paddles = await Paddle.findAll()
  res.json(paddles)
})

router.get('/:id', async (req, res) => {
  const paddle = await Paddle.findByPk(req.params.id)
  if (paddle) {
    res.json(paddle)
  } else {
    res.status(404).end()
  }
})

router.post('/', async (req, res) => {
  const { start_time, end_time, info, user_id, club_id, equipment_id } = req.body
  if (!user_id || !club_id || !equipment_id) {
    return res.status(400).json({ error: 'user_id, club_id and equipment_id are required' })
  }
  try {
    const paddle = await Paddle.create({ start_time, end_time, info, user_id, club_id, equipment_id })
    res.status(201).json(paddle)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/:id', async (req, res) => {
  const paddle = await Paddle.findByPk(req.params.id)
  if (!paddle) {
    return res.status(404).json({ error: 'Paddle not found' })
  }
  const { start_time, end_time, info, user_id, club_id, equipment_id } = req.body
  await paddle.update({ start_time, end_time, info, user_id, club_id, equipment_id })
  res.json(paddle)
})
router.delete('/:id', async (req, res) => {
  const paddle = await Paddle.findByPk(req.params.id)
  if (paddle) {
    await paddle.destroy()
    res.status(204).end()
  } else {
    res.status(404).end()
  }
})

module.exports = router
