import { Request, Response, NextFunction } from "express";

import { cognitoVerifier } from "../config/congnito";
// import { syncUser } from "../services/user.service";
import { prisma } from "../config/database";

export async function signupAuthentication(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is required",
      });
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const payload = await cognitoVerifier.verify(token);

    console.log(req.headers["x-user-email"]);

    const cognitoUserId = payload.sub;

    if (!cognitoUserId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const email = req.headers["x-user-email"] as string;

    req.user = {
      cognitoUserId: cognitoUserId,
      email,
    };

    next();
  } catch (error) {
    console.error("Authentication failed", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}
