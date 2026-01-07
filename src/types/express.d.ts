import type { User } from "./users";

declare global {
  namespace Express {
    interface Request {
      user?: User & {
        id: string;
        role: string;
      };
    }
  }
}
