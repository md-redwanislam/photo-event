import { Router } from "express";

import * as fileController from "../controllers/file.controller";
import isAdmin from "../middlewares/isAdmin";
import catchAsync from "../utils/catchAsync";
import singleUpload from "./../utils/multer";

const router = Router();

router
  .route("/upload")
  .post(singleUpload, catchAsync(fileController.uploadImage));
router.route("/").get(isAdmin, catchAsync(fileController.getImages));

router
  .route("/:imageId")
  .get(isAdmin, catchAsync(fileController.getImageById))
  .patch(isAdmin, catchAsync(fileController.updateImageStatus));

export default router;
