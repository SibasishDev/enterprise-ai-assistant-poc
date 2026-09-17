import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../config/database";

export async function getDocumentAccess(req: Request, res: Response) {
  const auth = req.auth!;
  const documentId = req.params.documentId as string;

  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      tenantId: auth.tenantId,
    },
  });

  if (!document) {
    return res.status(404).json({
      message: "Document not found",
    });
  }

  const access = await prisma.documentAccess.findMany({
    where: {
      documentId,
    },

    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          department: true,
        },
      },
    },
  });

  return res.json(access);
}

export async function updateDocumentAccess(req: Request, res: Response) {
  const auth = req.auth!;
  const documentId = req.params.documentId as string;

  const { userIds } = req.body;

  if (!Array.isArray(userIds)) {
    return res.status(400).json({
      message: "userIds must be an array",
    });
  }

  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      tenantId: auth.tenantId,
    },
  });

  if (!document) {
    return res.status(404).json({
      message: "Document not found",
    });
  }

  // Validate users belong to same tenant
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
      tenantId: auth.tenantId,
    },

    select: {
      id: true,
    },
  });

  if (users.length !== userIds.length) {
    return res.status(400).json({
      message: "One or more users do not belong to this tenant",
    });
  }

  await prisma.$transaction([
    prisma.documentAccess.deleteMany({
      where: {
        documentId,
      },
    }),

    prisma.documentAccess.createMany({
      data: userIds.map((userId: string) => ({
        userId,
        documentId,
      })),
    }),
  ]);

  return res.json({
    message: "Document access updated",
  });
}
