const router = require('express').Router()
const { tokenExtractor, isMember, isSuperAdmin, isAdmin } = require('../util/middlevare')
const { Paddle, User, Equipment } = require('../models');
const { findSuperadmin, findAdmin, addPaddlePermissions } = require('../util/helperFunctions')
const { info: logInfo, error: logError } = require('../util/logger')
const { Op } = require('sequelize'); // Added Op for complex queries

// Standard include and attributes configuration for paddle queries
const getPaddleQueryConfig = () => ({
  include: [
    {
      model: User,
      attributes: ['name', 'username'],
      as: 'user'
    },
    {
      model: Equipment,
      attributes: ['name', 'type', 'clubId'],
      as: 'equipment'
    }
  ],
  attributes: ['id', 'startTime', 'endTime', 'info', 'userId', 'equipmentId', 'clubId', 'length', 'visitors', 'additionalInfo']
});

// Some additional middleware for paddles

const canEditPaddle = async (req, res, next) => {
  
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
  const paddle = await Paddle.findByPk(req.params.id, getPaddleQueryConfig())
  if (paddle) {
    res.json(paddle)
  } else {
    res.status(404).end()
  }
})

// Add pagination and filtering to GET endpoint
//  
router.get('/club/:clubId', tokenExtractor, isMember, async (req, res) => {
  const { clubId } = req.params;
  // Default values for pagination and filtering, they change if query params are provided
  const { page = 1, limit = 20, showActive = null, userId = null } = req.query;
  const currentUserId = parseInt(req.decodedToken.id);
  
  try {
    const offset = (page - 1) * limit;
    
    // Build where clause
    let whereClause = { club_id: clubId };
    
    // Filter by user if specified
    if (userId) {
      whereClause.userId = parseInt(userId);
      console.log('Filtering by user ID:', whereClause.userId, 'Type:', typeof whereClause.userId);
    }
    
    // Filter by active status if specified
    if (showActive === 'true') {
      // Show only active paddles (not completed)
      whereClause = {
        ...whereClause,
        [Op.or]: [
          { endTime: null }, // No end time
          { endTime: { [Op.gt]: new Date() } } // End time in future
        ]
      };
    } else if (showActive === 'false') {
      // Show only completed paddles
      whereClause = {
        ...whereClause,
        endTime: { [Op.not]: null } // Has end time
      };
    }
    // If showActive is null/undefined, show all paddles
    
    console.log('Final where clause:', JSON.stringify(whereClause, null, 2));
    
    const paddles = await Paddle.findAndCountAll({
      where: whereClause,
      ...getPaddleQueryConfig(),
      order: [['startTime', 'DESC']], // Most recent first
      limit: parseInt(limit),
      offset: offset
    });

    // Add permissions to each paddle
    const paddlesWithPermissions = await Promise.all(
      paddles.rows.map(paddle => addPaddlePermissions(paddle.toJSON(), currentUserId))
    )

    res.json({
      paddles: paddlesWithPermissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(paddles.count / limit),
        totalItems: paddles.count,
        itemsPerPage: parseInt(limit)
      }
    })

  } catch (error) {
    console.error('Error fetching paddles:', error);
    res.status(500).json({ error: error.message });
  }
});

// Maybe later users have to be able to create paddles for other users
// For now, only the user who is creating the paddle can "own" the paddle
router.post('/', tokenExtractor, async (req, res) => {
  const { startTime, endTime, info, clubId, equipmentId, length, visitors, additionalInfo } = req.body
  const userId = req.decodedToken.id // This is the user who is creating the paddle
  if (!clubId || !equipmentId) {
    return res.status(400).json({ error: 'clubId and equipmentId are required' })
  }
  try {
    const paddle = await Paddle.create({ 
      startTime, 
      endTime, 
      info, 
      userId, 
      clubId, 
      equipmentId,
      length,
      visitors,
      additionalInfo
    })
    const paddleWithEquipment = await Paddle.findByPk(paddle.id, getPaddleQueryConfig())

    const paddleWithPermissions = await addPaddlePermissions(paddleWithEquipment.toJSON(), userId);

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
  const { startTime, endTime, info, userId, clubId, equipmentId, length, visitors, additionalInfo } = req.body
  await paddle.update({ 
    startTime, 
    endTime, 
    info, 
    userId, 
    clubId, 
    equipmentId,
    length,
    visitors,
    additionalInfo
  })
  
  // Return the updated paddle with the same structure as GET endpoints
  const updatedPaddle = await Paddle.findByPk(req.params.id, getPaddleQueryConfig())

  const paddleWithPermissions = await addPaddlePermissions(updatedPaddle.toJSON(), req.decodedToken.id);

  res.json(paddleWithPermissions)
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
