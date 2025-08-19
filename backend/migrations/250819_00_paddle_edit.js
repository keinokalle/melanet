const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    // Add length field to paddles table
    await queryInterface.addColumn('paddles', 'length', {
      type: DataTypes.FLOAT,
      allowNull: true,
      after: 'end_time'
    });

    // Add additionalInfo field to paddles table
    await queryInterface.addColumn('paddles', 'additional_info', {
      type: DataTypes.TEXT,
      allowNull: true,
      after: 'length'
    });
  },

  down: async ({ context: queryInterface }) => {
    // Remove additionalInfo field
    await queryInterface.removeColumn('paddles', 'additional_info');
    
    // Remove length field
    await queryInterface.removeColumn('paddles', 'length');
  }
};
