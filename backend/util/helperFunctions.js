const { User, Membership } = require('../models')

// Find if a user is a superadmin
const findSuperadmin = async (userId) => {
  const user = await User.findByPk(userId)
  return user && user.isSuperadmin ? user : null
}

// Find if a user is an admin for a specific club
const findAdmin = async (userId, clubId) => {
  return Membership.findOne({
    where: {
      userId,
      clubId,
      isAdmin: true
    }
  })
}

// Find if a user is a member of a specific club
const findMember = async (userId, clubId) => {
  return Membership.findOne({
    where: {
      userId,
      clubId
    }
  })
}

// Add permissions to paddle data
const addPaddlePermissions = async (paddleData, userId) => {
  // Check if user is superadmin
  const isSuperadmin = await findSuperadmin(userId)
  
  // Check if user is club admin
  const isClubAdmin = await findAdmin(userId, paddleData.clubId)

  return {
    ...paddleData,
    canEdit: 
      paddleData.userId === userId || // User owns the paddle
      isClubAdmin || // User is club admin
      isSuperadmin // User is superadmin
  }
}

module.exports = {
  findSuperadmin,
  findAdmin,
  findMember,
  addPaddlePermissions
}