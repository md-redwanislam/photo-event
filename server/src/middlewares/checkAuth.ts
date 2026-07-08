import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import config from "../configs/config";
import { CustomError } from "../types";

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  if (
    req.path === "/" ||
    req.path === "/api/v1/auth/register" ||
    req.path === "/api/v1/auth/login" ||
    req.path === "/api/v1/admin/login" ||
    // req.path === "/api/v1/image" ||
    req.path.startsWith("/api/v1/image") ||
    req.path === "/api/v1/admin/register"
  ) {
    return next();
  }
  let token = req.cookies.authToken;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    const err = new Error("Token not found") as CustomError;
    err.statusCode = 401;
    return next(err);
  }

  try {
    const decoded = jwt.verify(
      token,
      config.jwtoken.secretKey as string,
    ) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export default checkAuth;
