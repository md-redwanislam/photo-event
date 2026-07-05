import bcrypt from "bcryptjs";
import { ResultSetHeader } from "mysql2";
import { randomUUID } from "node:crypto";
import db from "../configs/db";
import cloudinary from "../libs/cloudinary";
import { Admin, CustomError } from "../types";
import { bufferToUuid } from "../utils";
import getDataUri from "../utils/dataUri";
import getNewToken from "../utils/getNewToken";

const register = async (
  name: string,
  bio: string,
  email: string,
  password: string,
  profile_pic: Express.Multer.File | null,
) => {
  const [admins] = await db.execute<Admin[]>(
    "select * from admins where email = ?",
    [email],
  );

  if (admins.length > 0) {
    const err = new Error(
      "Admin already exists with this email.",
    ) as CustomError;
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let profilePicUrl: string | null = null;

  if (profile_pic) {
    const fileUri = getDataUri(profile_pic);

    const cloudResponse = await cloudinary.uploader.upload(fileUri.content!, {
      folder: "Photo Event/admins",
      transformation: [{ width: 200, height: 200, crop: "fill" }],
    });

    profilePicUrl = cloudResponse.url;
  }

  const id = randomUUID();

  await db.execute<ResultSetHeader>(
    `INSERT INTO admins
      (
        id,
        name,
        email,
        password,
        bio,
        profile_pic
      )
     VALUES
      (
        UUID_TO_BIN(?),
        ?,
        ?,
        ?,
        ?,
        ?
      )`,
    [id, name, email, hashedPassword, bio ?? null, profilePicUrl],
  );

  return {
    id,
    name,
    email,
    bio,
    profile_pic: profilePicUrl,
  };
};

const login = async (email: string, password: string) => {
  const [admin] = await db.execute<Admin[]>(
    "select * from admins where email = ?",
    [email],
  );

  if (admin.length == 0) {
    const err = new Error("Admin not found with this email.") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const isPasswordMatch = await bcrypt.compare(password, admin[0]?.password);

  if (!isPasswordMatch) {
    const err = new Error("Incorrect password") as CustomError;
    err.statusCode = 401;
    throw err;
  }

  const id = Buffer.isBuffer(admin[0].id)
    ? bufferToUuid(admin[0].id)
    : admin[0].id;

  const { password: _pw, ...safeUser } = admin[0];

  const responseUser = { ...safeUser, id };

  const { token } = await getNewToken(responseUser);

  return { admin: responseUser, token };
};

const resetPassword = async (
  adminId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const [admins] = await db.execute<Admin[]>(
    `SELECT *
     FROM admins
     WHERE id = UUID_TO_BIN(?)`,
    [adminId],
  );

  if (admins.length === 0) {
    const err = new Error("Admin not found.") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const admin = admins[0];

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    admin.password,
  );

  if (!isPasswordCorrect) {
    const err = new Error("Current password is incorrect.") as CustomError;
    err.statusCode = 401;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.execute<ResultSetHeader>(
    `UPDATE admins
     SET password = ?
     WHERE id = UUID_TO_BIN(?)`,
    [hashedPassword, adminId],
  );

  return `Password changed for ${admin?.name} successfully`;
};

export { login, register, resetPassword };
