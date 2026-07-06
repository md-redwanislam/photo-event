import { Request, Response } from "express";

import * as AdminService from "../services/admin.service";
import { CustomError } from "../types/index.js";

const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  const { name, bio, email, password } = req.body as {
    name: string;
    bio: string;
    email: string;
    password: string;
  };

  const profile_pic = (req.file as Express.Multer.File) ?? null;

  if (!name || !email || !password) {
    const err = new Error("Please fill all details") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  const result = await AdminService.register(
    name,
    bio,
    email,
    password,
    profile_pic,
  );

  res.status(201).send({
    success: true,
    message: "Admin registration successful",
    data: result,
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
  const { admin, token } = await AdminService.login(email, password);

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
      data: admin,
    });
};

const resetAdminPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const adminId = req.user?.id as string;

  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };

  if (!currentPassword || !newPassword) {
    const err = new Error(
      "Current password and new password are required.",
    ) as CustomError;
    err.statusCode = 400;
    throw err;
  }

  const message = await AdminService.resetPassword(
    adminId,
    currentPassword,
    newPassword,
  );

  res.status(200).json({
    success: true,
    message,
  });
};

const updateAdmin = async (req: Request, res: Response): Promise<void> => {
  const adminId = req.user?.id;

  if (!adminId) {
    const err = new Error("Provide admin's info.") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const { name, email, bio } = req.body as {
    name: string;
    email: string;
    bio: string;
  };

  const profile_pic = (req.file as Express.Multer.File) ?? null;

  // if (!name || !email || !bio || !profile_pic) {
  //   const err = new Error(
  //     "All fields are required for full update",
  //   ) as CustomError;
  //   err.statusCode = 400;
  //   throw err;
  // }

  const message = await AdminService.updateById(
    adminId,
    name,
    email,
    bio,
    profile_pic,
  );

  res.status(200).send({
    success: true,
    message,
  });
};

export { loginAdmin, registerAdmin, resetAdminPassword, updateAdmin };
