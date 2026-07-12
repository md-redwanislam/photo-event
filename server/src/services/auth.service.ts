import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { ResultSetHeader } from "mysql2";

import db from "../configs/db";
import { sendSMS } from "../libs/sendSMS";
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

  await db.execute<ResultSetHeader>(
    `INSERT INTO users
      (id, name, phone, institute_name, class_name, password)
     VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?)`,
    [id, name, phone, institute_name, class_name, hashedPassword],
  );

  const user = {
    id,
    name,
    phone,
    institute_name,
    class_name,
  };

  const { token } = await getNewToken(user);

  return {
    user,
    token,
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

const sendResetOtp = async (phone: string) => {
  const [users] = await db.execute<User[]>(
    `SELECT *
     FROM users
     WHERE phone = ?`,
    [phone],
  );

  if (!users.length) {
    const err = new Error("User not found.") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  await db.execute<ResultSetHeader>(
    `
    UPDATE users
    SET otp = ?,
    otp_expires_at = ?
    WHERE phone = ?
    `,
    [otp, expiry, phone],
  );

  const smsSent = await sendSMS(
    phone,
    `Your OTP is ${otp}. It will expire in 5 minutes.`,
  );

  if (!smsSent) {
    const err = new Error("Failed to send OTP.") as CustomError;
    err.statusCode = 500;
    throw err;
  }
};

const verifyResetOtp = async (phone: string, otp: string) => {
  const [users] = await db.execute<User[]>(
    `SELECT *
     FROM users
     WHERE phone = ?
     AND otp = ?`,
    [phone, otp],
  );

  if (!users.length) {
    const err = new Error("User not found.") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const user = users[0];

  if (!user.otp) {
    const err = new Error("OTP not found.") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  if (user.otp !== otp) {
    const err = new Error("Invalid OTP.") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  if (!user.otp_expires_at || new Date(user.otp_expires_at) < new Date()) {
    const err = new Error("OTP expired.") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  return true;
};

const resetPassword = async (phone: string, newPassword: string) => {
  const [users] = await db.execute<User[]>(
    `SELECT *
     FROM users
     WHERE phone = ?`,
    [phone],
  );

  if (!users.length) {
    const err = new Error("User not found.") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const user = users[0];

  if (!user.otp) {
    const err = new Error("OTP not found.") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  if (!user.otp_expires_at || new Date(user.otp_expires_at) < new Date()) {
    const err = new Error("OTP expired.") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.execute<ResultSetHeader>(
    `
    UPDATE users
    SET password = ?,
        otp = NULL,
        otp_expires_at = NULL
    WHERE phone = ?
    `,
    [hashedPassword || user.password, phone],
  );

  return "Password reset successful";
};

export { login, register, resetPassword, sendResetOtp, verifyResetOtp };
