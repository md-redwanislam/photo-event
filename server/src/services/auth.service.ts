import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { ResultSetHeader } from "mysql2";

import db from "../configs/db";
import { CustomError, User } from "../types/index.js";
import { bufferToUuid } from "../utils";
import getNewToken from "../utils/getNewToken";

const register = async (
  name: string,
  phone: string,
  institute_name: string,
  class_name: string,
  password: string,
) => {
  const [users] = await db.execute<User[]>(
    "select * from users where phone = ?",
    [phone],
  );

  if (users.length > 0) {
    const err = new Error(
      "User already exists with this number.",
    ) as CustomError;
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const id = randomUUID();
  const [rows] = await db.execute<ResultSetHeader>(
    `INSERT INTO users
    (id, name, phone, institute_name, class_name, password)
   VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?)`,
    [id, name, phone, institute_name, class_name, hashedPassword],
  );

  return {
    id,
    name,
    phone,
    institute_name,
    class_name,
  };
};

const login = async (phone: string, password: string) => {
  const [users] = await db.execute<User[]>(
    "select * from users where phone = ?",
    [phone],
  );

  if (users.length == 0) {
    const err = new Error(
      "User not found with this phone. please registration first.",
    ) as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const isPasswordMatch = await bcrypt.compare(password, users[0]?.password);

  if (!isPasswordMatch) {
    const err = new Error("Incorrect password") as CustomError;
    err.statusCode = 401;
    throw err;
  }

  const id = Buffer.isBuffer(users[0].id)
    ? bufferToUuid(users[0].id)
    : users[0].id;

  const { password: _pw, ...safeUser } = users[0];

  const responseUser = { ...safeUser, id };

  const { token } = await getNewToken(responseUser);

  return { user: responseUser, token };
};

export { login, register };
