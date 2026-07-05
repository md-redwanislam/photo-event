import { Request, Response } from "express";

import * as UserServices from "../services/user.service";
import { CustomError } from "../types";

const getUsers = async (_req: Request, res: Response): Promise<void> => {
  const result = await UserServices.get();
  res.status(200).send({
    success: true,
    message: "Users found",
    data: result,
  });
};

const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  if (!userId) {
    const err = new Error("User not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }
  const { user } = await UserServices.getById(userId);
  res.status(200).send({
    success: true,
    message: "Users found",
    data: user,
  });
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params as { userId: string };

  if (!userId) {
    const err = new Error("User not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const { name, phone, institute_name, class_name } = req.body as {
    name: string;
    phone: string;
    institute_name: string;
    class_name: string;
  };

  const user = await UserServices.updateById(
    userId,
    name,
    phone,
    institute_name,
    class_name,
  );

  res.status(200).send({
    success: true,
    message: "User updated successfully",
    data: user,
  });
};
export { getUserById, getUsers, updateUser };
