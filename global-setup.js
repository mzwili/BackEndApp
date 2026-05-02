const Database = require('better-sqlite3');

module.exports = async () => {
  console.log('🧹 GLOBAL DB RESET START');

  const db = new Database('backendApp.db');

  // Clear all user data
  db.exec(`DELETE FROM users;`);

  // Reset auto-increment counter (important)
  db.exec(`DELETE FROM sqlite_sequence WHERE name='users';`);

  db.close();

  console.log('🧹 GLOBAL DB RESET COMPLETE');
};