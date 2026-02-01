const mysql = require('mysql2');
// Create connection pool
const db = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'admin123',
  database: 'indlay',
  // user: 'uniform_user',
  // password: 'D?Vq44ff03RC',
  // database: 'uniform_admin',
});

db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.message);
  } else {
    // console.log('✅ MySQL connected');
    connection.release(); // release the connection back to pool
  }
});
module.exports = db;

