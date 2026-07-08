import { Router } from "express";

import * as ImageController from "../controllers/image.controller";
import catchAsync from "../utils/catchAsync";

const router = Router();

router.route("/").get(catchAsync(ImageController.getImages));
router.route("/:imageId").get(catchAsync(ImageController.getImageById));

export default router;
