import { Router } from "express";

import adminRouter from "./admin.router";
import authRouter from "./auth.router";
import fileRouter from "./file.router";
import imageRouter from "./image.router";

const customRoutes = Router();

customRoutes.use("/auth", authRouter);
customRoutes.use("/image", imageRouter);
customRoutes.use("/admin", adminRouter);
customRoutes.use("/file", fileRouter);

export default customRoutes;
