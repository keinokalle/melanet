const router = require('express').Router()

const { Club } = require('../models')

const clubFinder = async (req, res, next) => {
  req.club = await Club.findByPk(req.params.id)
  next()
}

router.get('/', async (req, res) => {
  const clubs = await Club.findAll()
  console.log('GET /api/clubs')
  console.log(JSON.stringify(clubs, null, 2))
  res.json(clubs)
})

// Get club by its id
router.get('/:id', clubFinder, async (req, res) => {
  if (req.club) {
    console.log(req.club.toJSON())
    res.json(req.club)
  } else {
    res.status(404).end()
  }
})

router.post('/', async (req, res) => {
  try {  
    const { name, location, email } = req.body
    const club = await Club.create({ name, location, email })
    res.json(club)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.put('/:id', clubFinder, async (req, res) => {
  if (req.club) {
    Object.assign(req.club, req.body)
    await req.club.save()
    res.json(req.club)
  } else {
    res.status(404).end()
  }
})

router.delete('/:id', clubFinder, async (req, res) => {
  if (req.club) {
    await req.club.destroy()
    res.status(204).end()
  } else {
    res.status(404).end()
  }
})

module.exports = router