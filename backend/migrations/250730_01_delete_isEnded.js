'use strict'

module.exports = {
  up: async ({ context: queryInterface }) => {
    // Remove the 'isEnded' column from the 'paddles' table
    await queryInterface.removeColumn('paddles', 'ended');
  },

  down: async (queryInterface, Sequelize) => {
    // Add the 'isEnded' column back to the 'paddles' table
    await queryInterface.addColumn('paddles', 'ended', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    })
  }
}
