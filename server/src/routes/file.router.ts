import { Router } from "express";

import * as FileController from "../controllers/file.controller";
import isAdmin from "../middlewares/isAdmin";
import catchAsync from "../utils/catchAsync";
import singleUpload from "../utils/multer";

const router = Router();

router
  .route("/upload")
  .post(singleUpload("image"), catchAsync(FileController.uploadImage));
router.route("/").get(isAdmin, catchAsync(FileController.getImages));

export default router;
