import bcrypt from "bcryptjs";
import { ResultSetHeader } from "mysql2";
import { randomUUID } from "node:crypto";
import db from "../configs/db";
import cloudinary from "../libs/cloudinary";
import { sendEmail } from "../libs/sendEmail";
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
    const err = new Error(
      "Admin does not found with this email.",
    ) as CustomError;
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

const updateById = async (
  adminId: string,
  name: string,
  email: string,
  bio: string,
  profile_pic: Express.Multer.File | null,
) => {
  const [admin] = await db.execute<Admin[]>(
    `Select * from admins 
     WHERE id = UUID_TO_BIN(?)`,
    [adminId],
  );

  let profilePicUrl: string | null = null;

  if (profile_pic) {
    const fileUri = getDataUri(profile_pic);

    const cloudResponse = await cloudinary.uploader.upload(fileUri.content!, {
      folder: "Photo Event/admins",
      transformation: [{ width: 200, height: 200, crop: "fill" }],
    });

    profilePicUrl = cloudResponse.url;
  }

  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE admins SET 
      name=?,
      email=?,
      bio=?,
      profile_pic=?
     WHERE id = UUID_TO_BIN(?)`,
    [
      name || admin[0].name,
      email || admin[0].email,
      bio || admin[0].bio,
      profilePicUrl || admin[0].profile_pic,
      adminId,
    ],
  );

  if (result.affectedRows === 0) {
    const err = new Error("Admin not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  return `Admin updated successfully`;
};

const emailVerify = async (email: string) => {
  const [admins] = await db.execute<Admin[]>(
    "SELECT * FROM admins WHERE email = ?",
    [email],
  );

  if (admins.length === 0) {
    const err = new Error("User not found with this email.") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const code = String(Math.floor(100000 + Math.random() * 900000)).toString();

  const expiry = new Date(Date.now() + 5 * 60 * 1000);

  await db.execute<ResultSetHeader>(
    `UPDATE admins
     SET otp = ?,
     otp_expires_at = ?
     WHERE email = ?`,
    [code, expiry, email],
  );

  await sendEmail(
    email,
    "OTP Verification",
    `Your OTP is ${code}. It will expire in 5 minutes.`,
  );

  return "OTP sent to your mail.";
};

const otpVerify = async (email: string, otp: string) => {
  const [admins] = await db.execute<Admin[]>(
    `SELECT *
     FROM admins
     WHERE email = ?
       AND otp = ?`,
    [email, otp],
  );

  if (admins.length === 0) {
    const err = new Error("Invalid OTP.") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const admin = admins[0];

  if (!admin.otp) {
    const err = new Error("OTP not found.") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  if (admin.otp !== otp) {
    const err = new Error("Invalid OTP.") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  if (!admin.otp_expires_at || new Date(admin.otp_expires_at) < new Date()) {
    const err = new Error("OTP expired.") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  return "OTP verified successfully.";
};

const resetPassword = async (email: string, password: string) => {
  const [admins] = await db.execute<Admin[]>(
    `SELECT *
     FROM admins
     WHERE email = ?`,
    [email],
  );

  if (admins.length === 0) {
    const err = new Error("Admin not found.") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const admin = admins[0];

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.execute<ResultSetHeader>(
    `UPDATE admins
     SET password = ?
      WHERE email = ?`,
    [hashedPassword, email],
  );

  return `Password changed for ${admin?.name} successfully`;
};

export { emailVerify, login, otpVerify, register, resetPassword, updateById };
