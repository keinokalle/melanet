const router = require('express').Router()
const { info: logInfo, error: logError } = require('../util/logger')

const { Club } = require('../models')

const clubFinder = async (req, res, next) => {
  req.club = await Club.findByPk(req.params.id)
  next()
}


// Get all clubs
router.get('/', async (req, res) => {
  logInfo('GET /api/clubs')
  const clubs = await Club.findAll({})
  logInfo('GET /api/clubs')
  logInfo('Clubs retrieved:', JSON.stringify(clubs, null, 2))
  res.json(clubs)
})


// Get club by its id
router.get('/:id', clubFinder, async (req, res) => {
  if (req.club) {
    logInfo('Club retrieved:', req.club.toJSON())
    res.json(req.club)
  } else {
    res.status(404).end()
  }
})

// Club can be created by superadmins
router.post('/', async (req, res) => {
  try {
    logInfo('POST /api/clubs - Request body:', req.body)
    const { name, location } = req.body
    logInfo('Extracted data:', { name, location })

    const club = await Club.create({ name, location })
    logInfo('Club created successfully:', club.toJSON())
    res.json(club)
  } catch (error) {
    logError('Error creating club:', error.message)
    logError('Full error:', error)
    res.status(400).json({ error: error.message })
  }
})


// Club can be modified by club admins (only their own club) and superadmins (all clubs)
router.put('/:id', clubFinder, async (req, res) => {
  if (req.club) {
    Object.assign(req.club, req.body)
    await req.club.save()
    res.json(req.club)
  } else {
    res.status(404).end()
  }
})

// Club can be only deleted by superadmins
router.delete('/:id', clubFinder, async (req, res) => {
  if (req.club) {
    await req.club.destroy()
    res.status(204).end()
  } else {
    res.status(404).end()
  }
})

module.exports = router