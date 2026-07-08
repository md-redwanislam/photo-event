import { Router } from "express";
import * as FAQController from "../controllers/faq.controller";

const router = Router();

router.get("/", FAQController.getFaqs);

export default router;
