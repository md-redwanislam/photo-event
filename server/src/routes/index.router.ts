import { Router } from "express";

import adminRouter from "./admin.router";
import authRouter from "./auth.router";
import imageRouter from "./file.router";
import userRouter from "./user.router";

const customRoutes = Router();

customRoutes.use("/auth", authRouter);
customRoutes.use("/user", userRouter);
customRoutes.use("/image", imageRouter);
customRoutes.use("/admin", adminRouter);

export default customRoutes;
