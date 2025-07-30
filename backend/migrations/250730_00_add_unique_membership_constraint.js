const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addIndex('memberships', ['user_id', 'club_id'], {
      unique: true,
      name: 'memberships_user_club_unique'
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeIndex('memberships', 'memberships_user_club_unique')
  }
} 