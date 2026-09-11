import { Request, Response, NextFunction } from "express";

import { cognitoVerifier } from "../config/congnito";
import { prisma } from "../config/database";

export async function authenticate(
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

    console.log(payload);

    const cognitoUserId = payload.sub;

    if (!cognitoUserId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        cognitoUserId,
      },
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "User is not registered",
      });
    }

    console.log(user);

    req.auth = {
      cognitoUserId,
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
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
