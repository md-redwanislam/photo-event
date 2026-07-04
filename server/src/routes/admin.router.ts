import { Router } from "express";

import * as AdminController from "../controllers/admin.controller";
import catchAsync from "../utils/catchAsync";

const router = Router();

router.route("/login").post(catchAsync(AdminController.loginAdmin));

export default router;
