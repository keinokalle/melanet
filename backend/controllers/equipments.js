const router = require('express').Router()
const { tokenExtractor } = require('../util/middlevare')
const { info: logInfo, error: logError } = require('../util/logger')
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
    logInfo('GET /api/equipments')
    logInfo('Equipments retrieved:', JSON.stringify(equipments, null, 2))
  res.json(equipments)
})

// Get all equipments for a specific club
router.get('/club/:clubId', async (req, res) => {
  const { clubId } = req.params
  try {
    const equipments = await Equipment.findAll({
      where: { clubId },
      attributes: { exclude: ['clubId'] },
      include: {
        model: Club,
        attributes: ['name', 'id']
      }
    })
    logInfo(`GET /api/equipments/club/${clubId}`)
    logInfo('Equipments for club retrieved:', JSON.stringify(equipments, null, 2))
    res.json(equipments)
  } catch (error) {
    logError('Error retrieving equipments for club:', error)
    res.status(500).json({ error: 'Failed to retrieve equipments for the specified club.' })
  }
})



// Get equipment by its id
router.get('/:id', equipmentFinder, async (req, res) => {
  if (req.equipment) {
          logInfo('Equipment retrieved:', req.equipment.toJSON())
    res.json(req.equipment)
  } else {
    res.status(404).end()
  }
})

// Create new equipment
router.post('/', async (req, res) => {
  try {  
    const equipment = await Equipment.create({...req.body})
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