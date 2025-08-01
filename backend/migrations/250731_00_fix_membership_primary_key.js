'use strict'

module.exports = {
  up: async ({ context: queryInterface }) => {
    // Remove primaryKey from user_id and club_id in memberships table
    // This requires recreating the table or altering constraints, as Sequelize does not support dropping primaryKey directly.
    // We'll drop the existing composite primary key constraint if it exists.

    // Remove existing primary key constraint if present
    // The constraint name may vary; for most setups, it's memberships_pkey or PRIMARY
    // We'll use raw SQL for portability
    await queryInterface.sequelize.query(`
      ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_pkey;
    `);

    // Ensure id is the only primary key (should already be the case if using autoIncrement id)
    // No further action needed if id is already primary key

    // Optionally, ensure unique constraint on (club_id, user_id) exists
    await queryInterface.addConstraint('memberships', {
      fields: ['club_id', 'user_id'],
      type: 'unique',
      name: 'memberships_club_id_user_id_unique'
    });
  },

  down: async ({ context: queryInterface }) => {
    // Revert: Remove the unique constraint and restore composite primary key if needed

    // Remove the unique constraint
    await queryInterface.removeConstraint('memberships', 'memberships_club_id_user_id_unique');

    // Restore composite primary key on (club_id, user_id)
    await queryInterface.sequelize.query(`
      ALTER TABLE memberships ADD PRIMARY KEY (club_id, user_id);
    `);
  }
}
