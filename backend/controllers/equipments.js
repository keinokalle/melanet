const router = require('express').Router()
const { tokenExtractor } = require('../util/middlevare')
const { Equipment, Club } = require('../models')

// Middleware to find equipment by id
const equipmentFinder = async (req, res, next) => {
  req.equipment = await Equipment.findByPk(req.params.id)
  next()
}

// Get all equipments
router.get('/', async (req, res) => {
  const equipments = await Equipment.findAll({
    attributes: { exclude: ['clubId'] },
    include: {
      model: Club,
      attributes: ['name']
    }
  })
  console.log('GET /api/equipments')
  console.log(JSON.stringify(equipments, null, 2))
  res.json(equipments)
})

// Get equipment by its id
router.get('/:id', equipmentFinder, async (req, res) => {
  if (req.equipment) {
    console.log(req.equipment.toJSON())
    res.json(req.equipment)
  } else {
    res.status(404).end()
  }
})

// Create new equipment
router.post('/', tokenExtractor, async (req, res) => {
  try {  
    const randomClub = await Club.findOne() // To be changed
    const equipment = await Equipment.create({...req.body, clubId: randomClub.id})
    res.json(equipment)
  } catch (error) {
    res.status(400).json({ error })
  }
})

// Update equipment by id
router.put('/:id', equipmentFinder, async (req, res) => {
  if (req.equipment) {
    Object.assign(req.equipment, req.body)
    await req.equipment.save()
    res.json(req.equipment)
  } else {
    res.status(404).end()
  }
})

// Delete equipment by id
router.delete('/:id', equipmentFinder, async (req, res) => {
  if (req.equipment) {
    await req.equipment.destroy()
    res.status(204).end()
  } else {
    res.status(404).end()
  }
})

module.exports = router