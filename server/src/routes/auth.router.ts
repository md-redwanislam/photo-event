import { Router } from "express";

import * as AuthController from "../controllers/auth.controller";
import catchAsync from "../utils/catchAsync";

const router = Router();

router.route("/register").post(catchAsync(AuthController.registerUser));
router.route("/login").post(catchAsync(AuthController.loginUser));
router.route("/logout").post(catchAsync(AuthController.logoutUser));

export default router;
