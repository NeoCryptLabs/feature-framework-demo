import { Request } from "express";

export type RoleType = "ADMIN" | "VIEWER";

export interface JwtPayload {
  userId: string;
  email: string;
  role: RoleType;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
