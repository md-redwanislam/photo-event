import { Request, Response } from "express";

import * as AuthServices from "../services/auth.service";

import { CustomError } from "../types/index.js";

const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, phone, institute_name, class_name, password } = req.body;

  if (!name || !phone || !institute_name || !class_name || !password) {
    const err = new Error("Please fill all details") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  const { user, token } = await AuthServices.register(
    name,
    phone,
    institute_name,
    class_name,
    password,
  );

  res
    .cookie("authToken", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(201)
    .send({
      success: true,
      message: "Registration successful",
      data: user,
    });
};
const loginUser = async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }
  const { user, token } = await AuthServices.login(phone, password);

  res
    .cookie("authToken", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .send({
      success: true,
      message: "Login successful",
      data: user,
    });
};

const logoutUser = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("authToken").status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

const sendResetOtp = async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required",
    });
  }

  await AuthServices.sendResetOtp(phone);

  res.status(200).json({
    success: true,
    message: "OTP sent successfully",
  });
};

const verifyOtp = async (req: Request, res: Response) => {
  const phone = req.query.phone as string;

  const { otp } = req.body;

  await AuthServices.verifyResetOtp(phone, otp);

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
  });
};

const resetPassword = async (req: Request, res: Response) => {
  const phone = req.query.phone as string;

  const { newPassword } = req.body;

  await AuthServices.resetPassword(phone, newPassword);

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
};

export {
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  sendResetOtp,
  verifyOtp,
};
