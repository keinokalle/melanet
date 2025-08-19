const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    // Add visitors field to paddles table
    await queryInterface.addColumn('paddles', 'visitors', {
      type: DataTypes.INTEGER,
      allowNull: true,
      after: 'additional_info'
    });
  },

  down: async ({ context: queryInterface }) => {
    // Remove visitors field from paddles table
    await queryInterface.removeColumn('paddles', 'visitors');
  }
};
