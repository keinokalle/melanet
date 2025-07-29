const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('memberships', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
      club_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'clubs', key: 'id' }
      }
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('memberships')
  }
}