const { info: logInfo, error: logError } = require('./logger')
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
  logError('Error occurred:', err.name)
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({error: 'the value must be unique'})
  } else if (err.name === 'ReferenceError') {
    return res.status(400).json({error: 'the value must be unique'})
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
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      logInfo('Token extracted:', authorization.substring(7))
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET)
      logInfo('Token decoded successfully:', req.decodedToken)
    } catch (error){
      logError('Token verification failed:', error)
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    return res.status(401).json({ error: 'token missing' })
  }
  next()
}

const isAdmin = async (req, res, next) => {
  // Checking this later
  /*
  const user = await Membership.findByPk(req.decodedToken.id)
  if(user.role !== 'admin' && user.role !== 'superadmin') {
    return res.status(401).json({ error: 'unauthorized' })
  }
  */
  next()
}

const isSuperAdmin = async (req, res, next) => {
  const user = await User.findByPk(req.decodedToken.id)
  if(!user.isSuperadmin) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  next()
}

module.exports = {
  requestLogger,
  tokenExtractor,
  isAdmin,
  isSuperAdmin,
  unknownEndpoint,
  errorHandler
}