import { Request, Response } from "express";

import * as AuthServices from "../services/auth.service";

import { CustomError } from "../types/index.js";

const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, phone, institute_name, class_name, password } = req.body as {
    name: string;
    phone: string;
    institute_name: string;
    class_name: string;
    password: string;
  };

  if (!name || !phone || !institute_name || !class_name || !password) {
    const err = new Error("Please fill all details") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  const result = await AuthServices.register(
    name,
    phone,
    institute_name,
    class_name,
    password,
  );
  res.status(201).send({
    success: true,
    message: "Registration successful",
    data: result,
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

export { loginUser, logoutUser, registerUser };
