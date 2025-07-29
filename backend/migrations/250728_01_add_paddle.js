const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.createTable('paddles', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: true
      },
      info: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ended: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Changed from false to true since it can be NULL
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // Changed from CASCADE to SET NULL
      },
      club_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Changed from false to true since it can be NULL
        references: {
          model: 'clubs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // Changed from CASCADE to SET NULL
      },
      equipment_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Changed from false to true since it can be NULL
        references: {
          model: 'equipment',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // Changed from CASCADE to SET NULL
      }
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('paddles')
  }
}
