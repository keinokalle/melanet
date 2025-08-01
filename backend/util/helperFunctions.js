const { User, Membership } = require('../models');

// Find if a user is a superadmin
const findSuperadmin = async (userId) => {
  const user = await User.findByPk(userId);
  return user && user.isSuperadmin ? user : null;
};

// Find if a user is an admin for a specific club
const findAdmin = async (userId, clubId) => {
  return Membership.findOne({
    where: {
      userId,
      clubId,
      isAdmin: true
    }
  });
};

// Find if a user is a member of a specific club
const findMember = async (userId, clubId) => {
  return Membership.findOne({
    where: {
      userId,
      clubId
    }
  });
};

module.exports = {
  findSuperadmin,
  findAdmin,
  findMember
}