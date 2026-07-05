import { Request, Response } from "express";

import bcrypt from "bcryptjs";

import { ResultSetHeader } from "mysql2";
import { randomUUID } from "node:crypto";
import db from "../configs/db";
import { Admin, CustomError } from "../types/index.js";
import getNewToken from "../utils/getNewToken";
import { bufferToUuid } from "../utils/index";

const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body as {
    name: string;
    email: string;
    password: string;
  };

  if (!name || !email || !password) {
    const err = new Error("Please fill all details") as CustomError;
    err.statusCode = 400;
    throw err;
  }

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

  const id = randomUUID();
  await db.execute<ResultSetHeader>(
    `INSERT INTO admins
    (id, name, email, password)
   VALUES (UUID_TO_BIN(?), ?, ?, ?)`,
    [id, name, email, hashedPassword],
  );

  res.status(201).send({
    success: true,
    message: "Admin registration successful",
    data: {
      id,
      name,
      email,
    },
  });
};

const loginAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }
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

  res
    .cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .send({
      success: true,
      message: "Login successful",
      data: responseUser,
    });
};

export { loginAdmin, registerAdmin };
