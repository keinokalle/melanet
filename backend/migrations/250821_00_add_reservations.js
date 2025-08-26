const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    // Create the reservations table
    await queryInterface.createTable('reservations', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: true
      },
      equipment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'equipment',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      club_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'clubs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      detail: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    })

    // Add indexes for better performance
    await queryInterface.addIndex('reservations', ['user_id'])
    await queryInterface.addIndex('reservations', ['equipment_id'])
    await queryInterface.addIndex('reservations', ['club_id'])
    await queryInterface.addIndex('reservations', ['start_time'])
    await queryInterface.addIndex('reservations', ['start_time', 'end_time'])
  },

  down: async ({ context: queryInterface }) => {
    // Drop the reservations table
    await queryInterface.dropTable('reservations')
  }
}
