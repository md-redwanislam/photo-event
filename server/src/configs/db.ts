import mysql from "mysql2/promise";

import config from "./config";

// Create the connection pool
const db = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  ssl: {
    ca: config.db.cert!.replace(/\\n/g, "\n"), // Handle escaped newlines in the certificate
  },
  connectTimeout: 30000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// New helper function to test the connection on startup
export const testConnection = async (): Promise<void> => {
  // getConnection() forces the pool to open a real handshake with Aiven
  const connection = await db.getConnection();
  if (connection) {
    console.log("Successfully connected to the database!");
  }
  connection.release(); // Immediately give it back to the pool
};

export default db;
