import { Router } from "express";

import * as AuthController from "../controllers/auth.controller";
import catchAsync from "../utils/catchAsync";

const router = Router();

router.route("/register").post(catchAsync(AuthController.registerUser));
router.route("/login").post(catchAsync(AuthController.loginUser));
router.route("/logout").post(catchAsync(AuthController.logoutUser));

router.post(
  "/reset-password/send-otp",
  catchAsync(AuthController.sendResetOtp),
);

router.post("/reset-password/verify-otp", catchAsync(AuthController.verifyOtp));

router.put("/reset-password", catchAsync(AuthController.resetPassword));

export default router;
