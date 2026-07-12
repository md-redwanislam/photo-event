import { Router } from "express";

import * as AdminController from "../controllers/admin.controller";
import * as AuthController from "../controllers/auth.controller";
import * as FAQController from "../controllers/faq.controller";
import * as FileController from "../controllers/file.controller";
import * as UserController from "../controllers/user.controller";
import isAdmin from "../middlewares/isAdmin";
import catchAsync from "../utils/catchAsync";
import singleUpload from "../utils/multer";

const router = Router();

router.route("/faq").post(isAdmin, catchAsync(FAQController.createFaq));

router
  .route("/faq/:faqId")
  .get(isAdmin, catchAsync(FAQController.getFaqById))
  .put(isAdmin, catchAsync(FAQController.updateFaq))
  .delete(isAdmin, catchAsync(FAQController.deleteFaq));

router
  .route("/register")
  .post(singleUpload("profile_pic"), catchAsync(AdminController.registerAdmin));
router
  .route("/update")
  .put(singleUpload("profile_pic"), catchAsync(AdminController.updateAdmin));
router.route("/login").post(catchAsync(AdminController.loginAdmin));

router.post("/email-verify", catchAsync(AdminController.emailVerify));

router.post("/otp-verify", catchAsync(AdminController.otpVerify));

router.put("/reset-password", catchAsync(AdminController.resetPassword));

router.route("/logout").post(catchAsync(AuthController.logoutUser));

router
  .route("/user/create")
  .post(isAdmin, catchAsync(AuthController.registerUser));

router.route("/user").get(isAdmin, catchAsync(UserController.getUsers));

router
  .route("/user/:userId")
  .get(isAdmin, catchAsync(UserController.getUserById))
  .delete(isAdmin, catchAsync(UserController.deleteUserById))
  .put(isAdmin, catchAsync(UserController.updateUser));

router.route("/image").get(isAdmin, catchAsync(FileController.getAdminImages));
router
  .route("/image/:imageId")
  .get(isAdmin, catchAsync(FileController.getAdminImageById))
  .put(isAdmin, catchAsync(FileController.updateImageStatus))
  .delete(isAdmin, catchAsync(FileController.deleteImageById));

export default router;
