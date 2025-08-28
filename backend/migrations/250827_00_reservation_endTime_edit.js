const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    // First, update any existing reservations with null end_time to have a default end time
    // Set end_time to start_time + 2 hours for any null values
    await queryInterface.sequelize.query(`
      UPDATE reservations 
      SET end_time = start_time + INTERVAL '2 hours'
      WHERE end_time IS NULL
    `)

    // Now modify the end_time column to not allow null values
    await queryInterface.changeColumn('reservations', 'end_time', {
      type: DataTypes.DATE,
      allowNull: false
    })
  },

  down: async ({ context: queryInterface }) => {
    // Revert the end_time column to allow null values
    await queryInterface.changeColumn('reservations', 'end_time', {
      type: DataTypes.DATE,
      allowNull: true
    })
  }
}
