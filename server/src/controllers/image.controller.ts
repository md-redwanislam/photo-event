import { Request, Response } from "express";
import { CustomError } from "../types";

import * as ImageService from "../services/image.service";

const getImages = async (req: Request, res: Response): Promise<void> => {
  const result = await ImageService.getImages();
  res.status(200).send({
    success: true,
    message: "Images found successfully",
    data: result,
  });
};

const getImageById = async (req: Request, res: Response): Promise<void> => {
  const { imageId } = req.params;

  if (!imageId) {
    const err = new Error("Provide image's info") as CustomError;
    err.statusCode = 404;
    throw err;
  }
  const data = await ImageService.getImageById(imageId);
  res.status(200).send({
    success: true,
    message: "Image found successfully",
    data: data,
  });
};

export { getImageById, getImages };
