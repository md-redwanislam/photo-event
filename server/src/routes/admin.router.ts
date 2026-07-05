import { Router } from "express";

import * as AdminController from "../controllers/admin.controller";
import * as AuthController from "../controllers/auth.controller";
import * as FileController from "../controllers/file.controller";
import * as UserController from "../controllers/user.controller";
import isAdmin from "../middlewares/isAdmin";
import catchAsync from "../utils/catchAsync";

const router = Router();

router.route("/login").post(catchAsync(AdminController.loginAdmin));
router.route("/logout").post(catchAsync(AuthController.logoutUser));
router.route("/register").post(catchAsync(AdminController.registerAdmin));

router
  .route("/user/create")
  .post(isAdmin, catchAsync(AuthController.registerUser));

router.route("/user").get(isAdmin, catchAsync(UserController.getUsers));

router
  .route("/user/:userId")
  .get(isAdmin, catchAsync(UserController.getUserById))
  .patch(isAdmin, catchAsync(UserController.updateUser));

router.route("/image").get(isAdmin, catchAsync(FileController.getImages));
router
  .route("/image/:imageId")
  .get(isAdmin, catchAsync(FileController.getImageById))
  .patch(isAdmin, catchAsync(FileController.updateImageStatus));

export default router;
