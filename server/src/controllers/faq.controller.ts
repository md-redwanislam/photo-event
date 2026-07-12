import { Request, Response } from "express";
import * as FAQService from "../services/faq.services";
import { CustomError } from "../types";

const createFaq = async (req: Request, res: Response): Promise<void> => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    const err = new Error("Question and answer are required") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  const result = await FAQService.createFaq(question, answer);

  res.status(201).send({
    success: true,
    message: result.message,
  });
};

const getFaqs = async (_req: Request, res: Response): Promise<void> => {
  const data = await FAQService.getFaqs();

  res.status(200).send({
    success: true,
    message: "FAQs fetched successfully",
    data,
  });
};

const getAdminFaqs = async (_req: Request, res: Response): Promise<void> => {
  const data = await FAQService.getFaqs();

  res.status(200).send({
    success: true,
    message: "FAQs fetched successfully",
    data,
  });
};

const getFaqById = async (req: Request, res: Response): Promise<void> => {
  const { faqId } = req.params;

  if (!faqId) {
    const err = new Error("Provide FAQ id") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  const data = await FAQService.getFaqById(faqId);

  res.status(200).send({
    success: true,
    message: "FAQ fetched successfully",
    data,
  });
};

const updateFaq = async (req: Request, res: Response): Promise<void> => {
  const { faqId } = req.params;

  if (!faqId) {
    const err = new Error("Provide FAQ id") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  const { question, answer } = req.body;

  const message = await FAQService.updateFaq(faqId, question, answer);

  res.status(200).send({
    success: true,
    message,
  });
};

const deleteFaq = async (req: Request, res: Response): Promise<void> => {
  const { faqId } = req.params;

  if (!faqId) {
    const err = new Error("Provide FAQ id") as CustomError;
    err.statusCode = 400;
    throw err;
  }

  const result = await FAQService.deleteFaq(faqId);

  res.status(200).send({
    success: true,
    message: result.message,
  });
};

export { createFaq, deleteFaq, getAdminFaqs, getFaqById, getFaqs, updateFaq };
