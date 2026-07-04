import { Request, Response } from "express";

import bcrypt from "bcryptjs";

import db from "../configs/db";
import { Admin, CustomError } from "../types/index.js";
import getNewToken from "../utils/getNewToken";
import { bufferToUuid } from "../utils/index";

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

export { loginAdmin };
