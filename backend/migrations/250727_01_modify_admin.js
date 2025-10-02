const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    // Check if role column exists before trying to remove it
    const tableDescription = await queryInterface.describeTable('users')
    if (tableDescription.role) {
      // Remove the old 'role' column if it exists
      await queryInterface.removeColumn('users', 'role')
    }
    // Add the new 'role' column with ENUM type
    await queryInterface.addColumn('users', 'role', {
      type: DataTypes.ENUM('user', 'admin', 'superadmin'),
      allowNull: false,
      defaultValue: 'user'
    })
  },
  down: async ({ context: queryInterface }) => {
    // Remove the new 'role' column
    await queryInterface.removeColumn('users', 'role')
    // Add the old 'role' column back
    await queryInterface.addColumn('users', 'role', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'normal'
    })
  }
}