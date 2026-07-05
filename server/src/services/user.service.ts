import { ResultSetHeader } from "mysql2";
import db from "../configs/db";
import { CustomError, User } from "../types/index.js";
import { bufferToUuid } from "../utils";

const get = async () => {
  const [users] = await db.execute<User[]>(
    "select * from users order by created_at desc",
  );

  if (users.length <= 0) {
    const err = new Error("No users found") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const safeUsers = users.map((user) => {
    const id = Buffer.isBuffer(user.id) ? bufferToUuid(user.id) : user.id;
    const { password: _pw, ...safeUser } = user;
    return { ...safeUser, id };
  });

  return { users: safeUsers };
};

const getById = async (userId: string) => {
  const [users] = await db.execute<User[]>(
    "select * from users where id = UUID_TO_BIN(?)",
    [userId],
  );
  if (users.length === 0) {
    const err = new Error("User not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const id = Buffer.isBuffer(users[0].id)
    ? bufferToUuid(users[0].id)
    : users[0].id;

  const { password: _pw, ...safeUser } = users[0];

  const responseUser = { ...safeUser, id };

  return { user: responseUser };
};

const deleteById = async (userId: string) => {
  const [result] = await db.execute<ResultSetHeader>(
    "DELETE FROM users WHERE id = UUID_TO_BIN(?)",
    [userId],
  );

  if (result.affectedRows === 0) {
    const err = new Error("User not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  return { message: "User deleted successfully" };
};

const updateById = async (
  userId: string,
  name: string,
  phone: string,
  institute_name: string,
  class_name: string,
) => {
  await db.execute<User[]>(
    `UPDATE users SET 
      name = ?, 
      phone = ?, 
      institute_name = ?, 
      class_name = ?
     WHERE id = UUID_TO_BIN(?)`,
    [name, phone, institute_name, class_name, userId],
  );

  const { user } = await getById(userId);

  return { user };
};

export { deleteById, get, getById, updateById };
