import { AuthContext, UserContext } from "./auth";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      user?: UserContext;
    }
  }
}

export {};
