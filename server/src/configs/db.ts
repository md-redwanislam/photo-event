import mysql from "mysql2/promise";

import config from "./config";

const db = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  ssl: {
    ca: config.db.cert!.replace(/\\n/g, "\n"),
  },
  connectTimeout: 30000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const testConnection = async (): Promise<void> => {
  const connection = await db.getConnection();
  if (connection) {
    console.log("Successfully connected to the database!");
  }
  connection.release();
};

export default db;
