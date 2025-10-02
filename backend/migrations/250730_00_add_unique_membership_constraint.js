const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    // Check if the index already exists before creating it
    const indexes = await queryInterface.showIndex('memberships')
    const indexExists = indexes.some(index => index.name === 'memberships_user_club_unique')

    if (!indexExists) {
      await queryInterface.addIndex('memberships', ['user_id', 'club_id'], {
        unique: true,
        name: 'memberships_user_club_unique'
      })
    }
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeIndex('memberships', 'memberships_user_club_unique')
  }
}