import { Request, Response } from "express";

import * as AuthServices from "../services/auth.service";

import { CustomError } from "../types/index.js";

const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, phoneNumber, instititueName, rank, password } = req.body as {
    name: string;
    phoneNumber: string;
    instititueName: string;
    rank: string;
    password: string;
  };

  if (!name || !phoneNumber || !instititueName || !rank || !password) {
    const err = new Error("Please fill all details") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  const result = await AuthServices.register(
    name,
    phoneNumber,
    instititueName,
    rank,
    password,
  );
  res.status(201).send({
    success: true,
    message: "Registration successful",
    data: result,
  });
};

const loginUser = async (req: Request, res: Response) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }
  const { user, token } = await AuthServices.login(phoneNumber, password);

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
      data: user,
    });
};

const logoutUser = async (req: Request, res: Response): Promise<void> => {
  res
    .clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
    .status(200)
    .json({
      success: true,
      message: "Logged out successfully",
    });
};

export { loginUser, logoutUser, registerUser };
