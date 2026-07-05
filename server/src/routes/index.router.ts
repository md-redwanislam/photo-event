import { Router } from "express";

import adminRouter from "./admin.router";
import authRouter from "./auth.router";
import imageRouter from "./file.router";

const customRoutes = Router();

customRoutes.use("/auth", authRouter);

customRoutes.use("/image", imageRouter);
customRoutes.use("/admin", adminRouter);

export default customRoutes;
