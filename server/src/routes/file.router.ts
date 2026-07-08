import { Router } from "express";

import * as FileController from "../controllers/file.controller";
import catchAsync from "../utils/catchAsync";
import singleUpload from "../utils/multer";

const router = Router();

router
  .route("/upload")
  .post(singleUpload("image"), catchAsync(FileController.uploadImage));

router.route("/").get(FileController.getImages);
router.route("/:imageId").get(FileController.getImageById);

export default router;
