const router = require('express').Router()
const { tokenExtractor, isMember, isSuperAdmin, isAdmin } = require('../util/middlevare')
const { Reservation, User, Equipment } = require('../models')
const { findSuperadmin, findAdmin } = require('../util/helperFunctions')
const { info: logInfo, error: logError } = require('../util/logger')
const { Op } = require('sequelize')

// Standard include and attributes configuration for reservation queries
const getReservationQueryConfig = () => ({
  include: [
    {
      model: User,
      attributes: ['name', 'username'],
      as: 'user'
    },
    {
      model: Equipment,
      attributes: ['name', 'clubId'],
      as: 'equipment'
    }
  ],
  attributes: ['id', 'startTime', 'endTime', 'userId', 'equipmentId', 'clubId', 'detail']
})

// Middleware to check if user can edit a reservation
const canEditReservation = async (req, res, next) => {
  try {
    const userId = parseInt(req.decodedToken.id)
    console.log('Looking for reservation with ID:', req.params.id)
    
    const reservation = await Reservation.findByPk(req.params.id)
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' })
    }
    
    console.log('Found reservation:', reservation.toJSON())
    
    // Check if user is the owner of the reservation
    if (reservation.userId === userId) return next()
    
    // Check if user is admin of the club that owns this reservation
    if (await findAdmin(userId, reservation.clubId)) return next()
    
    // Check if user is superadmin
    if (await findSuperadmin(userId)) return next()
    
    return res.status(401).json({ error: 'unauthorized' })
  } catch (error) {
    console.error('Error in canEditReservation:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
}

// Get all reservations (superadmin only)
router.get('/', tokenExtractor, isSuperAdmin, async (req, res) => {
  try {
    const reservations = await Reservation.findAll(getReservationQueryConfig())
    logInfo('GET /api/reservations')
    res.json(reservations)
  } catch (error) {
    logError('Error fetching reservations:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get reservation by ID
router.get('/:id', tokenExtractor, async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, getReservationQueryConfig())
    if (reservation) {
      res.json(reservation)
    } else {
      res.status(404).end()
    }
  } catch (error) {
    logError('Error fetching reservation:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get reservations by club ID with filtering
router.get('/club/:clubId', tokenExtractor, isMember, async (req, res) => {
  const { clubId } = req.params
  const { page = 1, limit = 20, userId = null, showActive = null, equipmentId = null, date = null } = req.query
  const currentUserId = parseInt(req.decodedToken.id)
  
  try {
    const offset = (page - 1) * limit
    
    // Build where clause
    let whereClause = {}
    
    // Filter by user if specified
    if (userId) {
      whereClause.userId = parseInt(userId)
    }
    
    // Filter by equipment if specified
    if (equipmentId) {
      whereClause.equipmentId = parseInt(equipmentId)
    }
    
    // Filter by active status if specified
    if (showActive === 'true') {
      whereClause = {
        ...whereClause,
        endTime: { [Op.gt]: new Date() } // End time is in the future
      }
    } else if (showActive === 'false') {
      whereClause = {
        ...whereClause,
        endTime: { [Op.lte]: new Date() } // End time is in the past or now
      }
    }

    // Filter by specific date if specified
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      whereClause = {
        ...whereClause,
        startTime: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
      
      // Also filter out reservations that have already ended
      whereClause = {
        ...whereClause,
        endTime: { [Op.gt]: new Date() } // End time is in the future
      }
    }
    
    // Determine ordering based on filter type
    let orderBy = [['startTime', 'ASC']] // Default for Future filter
    
    if (userId) {
      // My filter - show most recent first (DESC)
      orderBy = [['startTime', 'DESC']]
    } else if (showActive === 'true') {
      // Future filter - show closest first (ASC)
      orderBy = [['startTime', 'ASC']]
    }
    
    const reservations = await Reservation.findAndCountAll({
      where: {
        ...whereClause,
        clubId: parseInt(clubId)
      },
      include: [
        {
          model: User,
          attributes: ['name', 'username'],
          as: 'user'
        },
        {
          model: Equipment,
          attributes: ['name', 'clubId'],
          as: 'equipment'
        }
      ],
      order: orderBy,
      limit: parseInt(limit),
      offset: offset
    })
    
    res.json({
      reservations: reservations.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(reservations.count / limit),
        totalItems: reservations.count,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    logError('Error fetching club reservations:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create a new reservation
router.post('/', tokenExtractor, async (req, res) => {
  try {
    const { startTime, endTime, equipmentId, clubId, detail } = req.body
    const userId = parseInt(req.decodedToken.id)
    
    // Validate required fields
    if (!startTime || !endTime || !equipmentId || !clubId) {
      return res.status(400).json({ 
        error: 'startTime, endTime, equipmentId, and clubId are required' 
      })
    }
    
    // Validate that endTime is after startTime
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ 
        error: 'endTime must be after startTime' 
      })
    }

    // In your reservation creation endpoint
    const overlappingReservations = await Reservation.findAll({
      where: {
        equipmentId: equipmentId,
        clubId: clubId,
        [Op.or]: [
          // New reservation starts during existing reservation
          {
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gt]: startTime }
          },
          // New reservation ends during existing reservation
          {
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gt]: startTime }
          }
        ]
      }
    })

    if (overlappingReservations.length > 0) {
      return res.status(400).json({
        error: 'Reservation overlaps with existing reservations',
        overlaps: overlappingReservations
      })
    }
    
    const reservation = new Reservation({
      startTime,
      endTime,
      userId,
      equipmentId,
      clubId,
      detail
    })
    
    const savedReservation = await reservation.save()
    const reservationWithDetails = await Reservation.findByPk(savedReservation.id, getReservationQueryConfig())
    
    res.status(201).json(reservationWithDetails)
  } catch (error) {
    logError('Error creating reservation:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update a reservation
router.put('/:id', tokenExtractor, canEditReservation, async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id)
    if (reservation) {
      Object.assign(reservation, req.body)
      await reservation.save()
      
      const updatedReservation = await Reservation.findByPk(reservation.id, getReservationQueryConfig())
      res.json(updatedReservation)
    } else {
      res.status(404).end()
    }
  } catch (error) {
    logError('Error updating reservation:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete a reservation
router.delete('/:id', tokenExtractor, canEditReservation, async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id)
    if (reservation) {
      await reservation.destroy()
      res.status(204).end()
    } else {
      res.status(404).end()
    }
  } catch (error) {
    logError('Error deleting reservation:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
