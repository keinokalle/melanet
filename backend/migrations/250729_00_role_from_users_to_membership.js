const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    // I just realized the role has to be in the memberships table, not users
    // because users can have multiple memberships

    // Remove the old 'role' column from users
    await queryInterface.removeColumn('users', 'role');
    // Add the new 'role' column with ENUM type to memberships
    await queryInterface.addColumn('memberships', 'role', {
      type: DataTypes.ENUM('user', 'admin', 'superadmin'),
      allowNull: false,
      defaultValue: 'user'
    })

    // Also, equipment type should be a enum
    await queryInterface.changeColumn('equipment', 'type', {
      type: DataTypes.ENUM('kayak', 'canoe', 'paddle', 'other'),
      allowNull: false
    })
  },
  down: async ({ context: queryInterface }) => {
    // Remove the 'role' column from memberships
    await queryInterface.removeColumn('memberships', 'role');
    // Add the 'role' column back to users
    await queryInterface.addColumn('users', 'role', {
      type: DataTypes.ENUM('user', 'admin', 'superadmin'),
      allowNull: false,
      defaultValue: 'user'
    });

    // Also, equipment type should be a string again
    await queryInterface.changeColumn('equipment', 'type', {
      type: DataTypes.STRING,
      allowNull: false
    })
  }
}