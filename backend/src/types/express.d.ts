import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      [key: string]: any;
    }
  }
}

export interface AuthenticatedRequest<B = any, P = any, Q = any> extends Express.Request {
  body: B;
  params: P;
  query: Q;
  user: User;
}
