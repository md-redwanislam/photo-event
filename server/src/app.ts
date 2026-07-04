import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";

import config from "./configs/config";
import checkAuth from "./middlewares/checkAuth";
import customRoutes from "./routes/index.router";
import { CustomError } from "./types";

const app: Application = express();

app.use(express.json({ limit: config.limit.maxJsonSize }));

app.use(
  express.urlencoded({
    extended: true,
    limit: config.limit.maxJsonSize,
  }),
);

app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(checkAuth);

app.use("/api/v1", customRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    connected: true,
  });
});

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
