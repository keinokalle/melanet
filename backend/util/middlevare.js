const { info: logInfo, error: logError, info } = require('./logger')
const jwt = require('jsonwebtoken')
const { SECRET } = require('./config')
const { Membership, User } = require('../models')

const requestLogger = (req, res, next) => {
  logInfo('Method:', req.method)
  logInfo('Path:  ', req.path)
  logInfo('Body:  ', req.body)
  logInfo('---')
  next()
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (err, req, res, next) => {
  console.log('Error occurred:', err.name, err.message)
  logError('Error occurred:', err.name)
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ error: 'the value must be unique' })
  } else if (err.name === 'ReferenceError') {
    return res.status(400).json({ error: 'the value must be unique' })
  }else if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'token missing or invalid' })
  } else if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'token expired',
    })
  }
  next(err)
}

const tokenExtractor = (req, res, next) => {
  logInfo('starting to extract token')
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      logInfo('Token extracted:', authorization.substring(7))
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
      logInfo('Token decoded successfully:', req.decodedToken)
      logInfo('TOKEN THING DONE!!!')
    } catch (error){
      logError('Token verification failed:', error)
      return res.status(401).json({ error: 'Token is either invalid or expired. Please log in again.' })
    }
  } else {
    return res.status(401).json({ error: 'Token is missing. Please log in again.' })
  }
  next()
}

// Checks if a user is a member of the club at hand
const isMember = async (req, res, next) => {
  const clubId = req.params.clubId
  const userId = req.decodedToken.id

  console.log('🔍 Checking membership for user:', userId, 'club:', clubId)

  try {
    // First check if user is a superadmin
    const user = await User.findByPk(userId)
    if (user && user.isSuperadmin) {
      console.log('✅ User is superadmin')
      return next()
    }

    // Then check if user is a member of the specific club
    const membership = await Membership.findOne({
      where: {
        userId: userId,
        clubId: clubId
      }
    })

    console.log('Found membership:', membership ? 'YES' : 'NO')

    if (!membership) {
      console.log('User not a member of club:', clubId)
      return res.status(401).json({ error: 'unauthorized' })
    }

    console.log('User is a member of the club')
    next()
  } catch (error) {
    console.error('Error in isMember:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// Checks if a user is a club admin for the club at hand
const isAdmin = async (req, res, next) => {
  const clubId = req.params.clubId
  const userId = req.decodedToken.id

  try {
    // First check if user is a superadmin
    const user = await User.findByPk(userId)
    if (user && user.isSuperadmin) {
      return next()
    }

    // Then check if user is a club admin for the specific club
    const membership = await Membership.findOne({
      where: {
        userId: userId,
        clubId: clubId,
        isAdmin: true
      }
    })

    if (!membership) {
      return res.status(403).json({ error: 'You do not have permission to perform this action. Please contact your administrator.' })
    }

    logInfo('HOOORAAYYYY!! User is a club admin')
    next()
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' })
  }
}

// Checks if a user is a superadmin
const isSuperAdmin = async (req, res, next) => {
  const user = await User.findByPk(req.decodedToken.id)
  if(!user.isSuperadmin) {
    return res.status(403).json({ error: 'You do not have permission to perform this action. Please contact your administrator.' })
  }
  next()
}

module.exports = {
  requestLogger,
  tokenExtractor,
  isMember,
  isAdmin,
  isSuperAdmin,
  unknownEndpoint,
  errorHandler
}