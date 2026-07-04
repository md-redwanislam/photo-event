import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string } | JwtPayload; // Adjust based on what your token stores (e.g., { id: string })
    }
  }
}
