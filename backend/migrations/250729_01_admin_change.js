const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    // Remove the 'role' column from memberships if it exists
    await queryInterface.removeColumn('memberships', 'role').catch(() => {})

    // Add 'isAdmin' boolean to memberships
    const membershipsDescription = await queryInterface.describeTable('memberships')
    if(!membershipsDescription.is_admin) {
      await queryInterface.addColumn('memberships', 'is_admin', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      })
    }

    // Add 'isSuperadmin' boolean to users
    const usersDescription = await queryInterface.describeTable('users') // Get users table description
    if(!usersDescription.is_superadmin) { // Check users table, not memberships
      await queryInterface.addColumn('users', 'is_superadmin', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      })
    }
  },

  down: async ({ context: queryInterface }) => {
    // Remove the 'isAdmin' column from memberships
    await queryInterface.removeColumn('memberships', 'is_admin')

    // Remove the 'isSuperadmin' column from users
    await queryInterface.removeColumn('users', 'is_superadmin')

    // Add the 'role' column back to memberships as ENUM
    await queryInterface.addColumn('memberships', 'role', {
      type: DataTypes.ENUM('user', 'admin', 'superadmin'),
      allowNull: false,
      defaultValue: 'user'
    })
  }
}
