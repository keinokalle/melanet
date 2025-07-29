const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    // Create clubs table
    await queryInterface.createTable('clubs', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      location: {
        type: DataTypes.STRING
      }
    });

    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      passwordhash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'normal'
      },
      language: {
        type: DataTypes.STRING
      },
      profilepicture: {
        type: DataTypes.TEXT
      }
    });

    // Create equipment table
    await queryInterface.createTable('equipment', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      length: {
        type: DataTypes.FLOAT
      },
      weight: {
        type: DataTypes.FLOAT
      },
      max_weight: {
        type: DataTypes.FLOAT
      },
      year_bought: {
        type: DataTypes.INTEGER
      },
      price: {
        type: DataTypes.FLOAT
      }
    });

    // Add foreign keys to equipment table
    try {
      await queryInterface.addColumn('equipment', 'club_id', {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'clubs', key: 'id' },
      });
    } catch (error) {
      console.log('club_id column might already exist, skipping...');
    }
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('equipment');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('clubs');
  },
}