import { NextFunction, Request, Response } from "express";
import db from "../configs/db";
import { Admin, CustomError } from "../types";

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find the user and check if they have admin role
    const [users] = await db.execute<Admin[]>(
      "select * from admins where id = UUID_TO_BIN(?)",
      [userId],
    );

    if (users.length == 0) {
      const err = new Error("Access denied.") as CustomError;
      err.statusCode = 401;
      return next(err);
    }

    // Check if user is an admin

    if (users[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error,
    });
  }
};

export default isAdmin;
