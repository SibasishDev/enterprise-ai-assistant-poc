import { Router } from "express";

import {
  getMe,
  getUsers,
  updateUserRole,
  updateUser,
  syncUserHandler,
  toggleUserDepartmentHandler,
} from "../controllers/user.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/rbac.middleware";
import { UserRole } from "@prisma/client";
import { signupAuthentication } from "../middleware/user.middleware";

const router = Router();

router.get("/me", authenticate, getMe);

router.get(
  "/",
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN),
  getUsers,
);

router.patch(
  "/:id/role",
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN),
  updateUserRole,
);

router.patch(
  "/:id",
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN),
  updateUser,
);

router.patch(
  "/:userId/update-departments",
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN),
  toggleUserDepartmentHandler,
);

router.post("/sync", signupAuthentication, syncUserHandler);

export default router;
