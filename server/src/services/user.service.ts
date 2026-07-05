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

const updateById = async (
  userId: string,
  name: string,
  phone: string,
  institute_name: string,
  class_name: string,
) => {
  await db.execute<User[]>(
    `update users set 
      name = coalesce(?, name), 
      phone = coalesce(?, phone), 
      institute_name = coalesce(?, institute_name), 
      class_name = coalesce(?, class_name)
     where id = UUID_TO_BIN(?)`,
    [
      name ?? null,
      phone ?? null,
      institute_name ?? null,
      class_name ?? null,
      userId,
    ],
  );

  const { user } = await getById(userId);

  return { user };
};

export { get, getById, updateById };
