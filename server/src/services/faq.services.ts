import { ResultSetHeader } from "mysql2";
import db from "../configs/db";
import { CustomError } from "../types";
import { bufferToUuid } from "../utils";

const createFaq = async (question: string, answer: string) => {
  await db.execute<ResultSetHeader>(
    `INSERT INTO faqs
      (
        question,
        answer
      )
      VALUES
      (
        ?,
        ?
      )`,
    [question, answer],
  );

  return { message: "FAQ created successfully" };
};

const getFaqs = async () => {
  const [rows] = await db.execute<any[]>(
    `SELECT * FROM faqs ORDER BY created_at DESC`,
  );

  return rows.map((faq) => ({
    ...faq,
    id: bufferToUuid(faq.id),
  }));
};

const getFaqById = async (faqId: string) => {
  const [rows] = await db.execute<any[]>(
    `SELECT * FROM faqs WHERE id = UUID_TO_BIN(?)`,
    [faqId],
  );

  if (rows.length === 0) {
    const err = new Error("FAQ not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  return {
    ...rows[0],
    id: bufferToUuid(rows[0].id),
  };
};

const updateFaq = async (faqId: string, question?: string, answer?: string) => {
  const faq = await getFaqById(faqId);

  const [result] = await db.execute<ResultSetHeader>(
    `UPDATE faqs
      SET
        question=?,
        answer=?
      WHERE id=UUID_TO_BIN(?)`,
    [question ?? faq.question, answer ?? faq.answer, faqId],
  );

  if (result.affectedRows === 0) {
    const err = new Error("FAQ not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  return "FAQ updated successfully";
};

const deleteFaq = async (faqId: string) => {
  const [result] = await db.execute<ResultSetHeader>(
    `DELETE FROM faqs WHERE id=UUID_TO_BIN(?)`,
    [faqId],
  );

  if (result.affectedRows === 0) {
    const err = new Error("FAQ not found") as CustomError;
    err.statusCode = 404;
    throw err;
  }

  return {
    message: "FAQ deleted successfully",
  };
};

export { createFaq, deleteFaq, getFaqById, getFaqs, updateFaq };
