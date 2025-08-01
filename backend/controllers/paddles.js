const router = require('express').Router()
const { tokenExtractor, isMember, isSuperAdmin, isAdmin } = require('../util/middlevare')
const { Paddle, User, Equipment } = require('../models');
const { findSuperadmin, findAdmin } = require('../util/helperFunctions')
const { info: logInfo, error: logError } = require('../util/logger')

// Some additional middleware for paddles

const canEditPaddle = async (req, res, next) => {
  const userId = req.decodedToken.id
  
  try {
    console.log('Looking for paddle with ID:', req.params.id);
    const paddle = await Paddle.findByPk(req.params.id);
    
    if (!paddle) {
      return res.status(404).json({ error: 'Paddle not found' });
    }
    
    console.log('Found paddle:', paddle.toJSON());
    
    // Check if user is the owner of the paddle
    if (paddle.userId === userId) return next();
    
    // Check if user is admin of the club that owns this paddle
    if (await findAdmin(userId, paddle.clubId)) return next();
    
    // Check if user is superadmin
    if (await findSuperadmin(userId)) return next();
    
    return res.status(401).json({ error: 'unauthorized' });
  } catch (error) {
    console.error('Error in canEditPaddle:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

router.get('/', tokenExtractor, isSuperAdmin, async (req, res) => {
  const paddles = await Paddle.findAll()
  res.json(paddles)
})

router.get('/:id', tokenExtractor, isSuperAdmin, async (req, res) => {
  const paddle = await Paddle.findByPk(req.params.id)
  if (paddle) {
    res.json(paddle)
  } else {
    res.status(404).end()
  }
})

router.get('/club/:clubId', tokenExtractor, isMember, async (req, res) => {
  const { clubId } = req.params
  const userId = req.decodedToken.id
  
  try {
    // Check if user is superadmin
    const isSuperadmin = await findSuperadmin(userId)
    
    // Check if user is club admin
    const isClubAdmin = await findAdmin(userId, clubId)
    
    const paddles = await Paddle.findAll({ 
      where: { club_id: clubId },
      include: [
        {
          model: User,
          attributes: ['name', 'username'],
          as: 'user'
        },
        {
          model: Equipment,
          attributes: ['name', 'type'],
          as: 'equipment'
        }
      ],
      attributes: ['id', 'startTime', 'endTime', 'info', 'userId']
    })

    // Add user permissions to each paddle
    const paddlesWithPermissions = paddles.map(paddle => {
      const paddleData = paddle.toJSON()
      paddleData.canEdit = 
        paddleData.userId === userId || // User owns the paddle
        isClubAdmin || // User is club admin
        isSuperadmin // User is superadmin
      
      return paddleData
    })

    res.json(paddlesWithPermissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

// Maybe later users have to be able to create paddles for other users
// For now, only the user who is creating the paddle can "own" the paddle
router.post('/', tokenExtractor, async (req, res) => {
  const { startTime, endTime, info, clubId, equipmentId } = req.body
  const userId = req.decodedToken.id // This is the user who is creating the paddle
  if (!clubId || !equipmentId) {
    return res.status(400).json({ error: 'clubId and equipmentId are required' })
  }
  try {
    const paddle = await Paddle.create({ startTime, endTime, info, userId, clubId, equipmentId })
    const paddleWithEquipment = await Paddle.findByPk(paddle.id, {
      include: [
        {
          model: User,
          attributes: ['name', 'username'],
          as: 'user'
        },
        {
          model: Equipment,
          attributes: ['name', 'type'],
          as: 'equipment'
        }
      ],
      attributes: ['id', 'startTime', 'endTime', 'info', 'userId']
    })

    // Check if user is superadmin
    const isSuperadmin = await findSuperadmin(userId)
    
    // Check if user is club admin
    const isClubAdmin = await findAdmin(userId, clubId)

    const paddleWithPermissions = {
      ...paddleWithEquipment.toJSON(),
      canEdit: 
        paddleWithEquipment.userId === userId || // User owns the paddle
        isClubAdmin || // User is club admin  
        isSuperadmin // User is superadmin
    }

    res.status(201).json(paddleWithPermissions);

  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.put('/:id', tokenExtractor, canEditPaddle, async (req, res) => {
  const paddle = await Paddle.findByPk(req.params.id)
  if (!paddle) {
    return res.status(404).json({ error: 'Paddle not found' })
  }
  const { startTime, endTime, info, userId, clubId, equipmentId } = req.body
  await paddle.update({ startTime, endTime, info, userId, clubId, equipmentId })
  res.json(paddle)
})

router.delete('/:id', tokenExtractor, canEditPaddle, async (req, res) => {
  const paddle = await Paddle.findByPk(req.params.id)
  if (paddle) {
    await paddle.destroy()
    res.status(204).end()
  } else {
    res.status(404).end()
  }
})

module.exports = router
