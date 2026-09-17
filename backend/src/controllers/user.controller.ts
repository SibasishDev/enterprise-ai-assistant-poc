import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../config/database";

export async function getMe(req: Request, res: Response) {
  const user = await prisma.user.findUnique({
    where: {
      id: req.auth!.userId,
    },
    select: {
      id: true,
      email: true,
      role: true,
      tenantId: true,
      department: true,
      jobTitle: true,
      location: true,
      isActive: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.json(user);
}

export async function getUsers(req: Request, res: Response) {
  const auth = req.auth!;

  const whereCondition =
    auth.role === UserRole.SUPER_ADMIN ? {} : { tenantId: auth.tenantId };

  const users = await prisma.user.findMany({
    where: whereCondition,
    select: {
      id: true,
      email: true,
      role: true,
      tenantId: true,
      jobTitle: true,
      location: true,
      isActive: true,
      createdAt: true,
      departments: {
        select: {
          departmentId: true,
          department: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.json(users);
}

export async function updateUserRole(req: Request, res: Response) {
  const auth = req.auth!;
  const userId = req.params.id as string;

  const { role } = req.body;

  if (!Object.values(UserRole).includes(role)) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!targetUser) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (
    auth.role !== UserRole.SUPER_ADMIN &&
    targetUser.tenantId !== auth.tenantId
  ) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  // Tenant admin cannot create SUPER_ADMIN
  if (auth.role === UserRole.TENANT_ADMIN && role === UserRole.SUPER_ADMIN) {
    return res.status(403).json({
      message: "Tenant admin cannot assign SUPER_ADMIN",
    });
  }

  // Tenant admin cannot modify another tenant
  if (
    auth.role === UserRole.TENANT_ADMIN &&
    targetUser.tenantId !== auth.tenantId
  ) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      role,
    },

    select: {
      id: true,
      email: true,
      role: true,
      tenantId: true,
    },
  });

  return res.json(updatedUser);
}

export async function updateUser(req: Request, res: Response) {
  const auth = req.auth!;
  const userId = req.params.id as string;

  const targetUser = await prisma.user.findUnique({
    where: {
      id: userId as string,
    },
  });

  if (!targetUser) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (
    auth.role !== UserRole.SUPER_ADMIN &&
    targetUser.tenantId !== auth.tenantId
  ) {
    return res.status(403).json({
      message: "Access denied",
    });
  }

  const { department, jobTitle, location, isActive } = req.body;

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      ...(department !== undefined && { department }),
      ...(jobTitle !== undefined && { jobTitle }),
      ...(location !== undefined && { location }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return res.json(updatedUser);
}

export async function syncUserHandler(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }
    const { email } = req.body;
    // Extract Cognito ID passed from your auth validation middleware
    const cognitoUserId = req.user.cognitoUserId;

    // 1. Check if the user already exists to protect database performance
    const existingUser = await prisma.user.findUnique({
      where: { cognitoUserId },
    });

    if (existingUser) {
      return res
        .status(200)
        .json({ message: "User already in sync", user: existingUser });
    }

    // 2. Perform a one-time clean insert
    const newUser = await prisma.user.create({
      data: {
        cognitoUserId: cognitoUserId,
        email,
        role: "USER",
        tenantId: "11111111-1111-1111-1111-111111111111", // Assign a default or incoming tenant container
        isActive: true,
      },
    });

    return res
      .status(201)
      .json({ message: "User provisioned successfully", user: newUser });
  } catch (error) {
    console.error("Sync error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function toggleUserDepartmentHandler(req: Request, res: Response) {
  try {
    const { userId } = req.params as { userId: string };
    const { departmentId, assign } = req.body;

    if (assign) {
      // Connect: Create entry link block if missing inside many-to-many join mappings
      await prisma.userDepartment.upsert({
        where: { userId_departmentId: { userId, departmentId } },
        update: {},
        create: { userId, departmentId },
      });
    } else {
      // Disconnect: Break relational links cleanly from database records matrix
      await prisma.userDepartment.deleteMany({
        where: { userId, departmentId },
      });
    }

    return res.json({
      success: true,
      message: "Multi-department layout mapping synchronized successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
