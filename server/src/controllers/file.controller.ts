import { Request, Response } from "express";

import * as FileService from "../services/file.service";
import { CustomError } from "../types";

const uploadImage = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id as string;

  const { caption } = req.body;

  const image = req.file as Express.Multer.File;
  if (!image) {
    const err = new Error("Please upload your file") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  await FileService.upload(userId, caption, image);

  res.status(201).json({
    success: true,
    message: "Image uploaded successfully",
  });
};

const getImages = async (_req: Request, res: Response): Promise<void> => {
  const result = await FileService.get();
  res.status(200).send({
    success: true,
    message: "Images found successfully",
    data: result,
  });
};

const getImageById = async (req: Request, res: Response): Promise<void> => {
  const { imageId } = req.params;

  if (!imageId) {
    const err = new Error("Image not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }
  const data = await FileService.getImageById(imageId);
  res.status(200).send({
    success: true,
    message: "Image found successfully",
    data: data,
  });
};

const deleteImageById = async (req: Request, res: Response): Promise<void> => {
  const { imageId } = req.params;

  if (!imageId) {
    const err = new Error("Image not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }
  const { message } = await FileService.deleteImageById(imageId);
  res.status(200).send({
    success: true,
    message,
  });
};

const updateImageStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const adminId = req.user?.id;
  const { imageId } = req.params;

  const { status, reason } = req.body;

  if (!imageId) {
    const err = new Error("Image not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }
  await FileService.updateImageById(adminId, imageId, status, reason);
  res.status(200).send({
    success: true,
    message: "Image status updated",
  });
};

export {
  deleteImageById,
  getImageById,
  getImages,
  updateImageStatus,
  uploadImage,
};
