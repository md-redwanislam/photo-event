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

const getUserImages = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id as string;

  if (!userId) {
    const err = new Error("Please provide user's info") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  const data = await FileService.getUserImage(userId);
  res.status(200).send({
    success: true,
    message: "Image found successfully",
    data: data,
  });
};

const getAdminImages = async (_req: Request, res: Response): Promise<void> => {
  const result = await FileService.getAdminImages();
  res.status(200).send({
    success: true,
    message: "Images found successfully",
    data: result,
  });
};

const getAdminImageById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { imageId } = req.params;

  if (!imageId) {
    const err = new Error("Proved image's info") as CustomError;
    err.statusCode = 404;
    throw err;
  }
  const data = await FileService.getAdminImageById(imageId);
  res.status(200).send({
    success: true,
    message: "Image found successfully",
    data: data,
  });
};

const deleteImageById = async (req: Request, res: Response): Promise<void> => {
  const { imageId } = req.params;

  if (!imageId) {
    const err = new Error("Proved image's info") as CustomError;
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

  if (!imageId) {
    const err = new Error("Proved image's info") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  const { caption, status, reason } = req.body as {
    caption: string;
    status: "approved" | "rejected";
    reason?: string;
  };

  const message = await FileService.updateImageStatus(
    adminId,
    imageId,
    caption,
    status,
    reason ?? null,
  );

  res.status(200).send({
    success: true,
    message,
  });
};

export {
  deleteImageById,
  getAdminImageById,
  getAdminImages,
  getUserImages,
  updateImageStatus,
  uploadImage,
};
