import { Router } from "express";

import { UserRole } from "@prisma/client";
import { authenticate } from "../middleware/auth.middleware";
import {
  createDepartmentController,
  deleteDepartmentController,
  getDepartmentsData,
  updateDepartmentController,
} from "../controllers/department.controller";
import { requireRoles } from "../middleware/rbac.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getDepartmentsData);

// router.get(
//   "/:id",
//   getDepartmentController
// );

router.post(
  "/",
  requireRoles(UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN),
  createDepartmentController,
);

router.patch(
  "/:id",
  requireRoles(UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN),
  updateDepartmentController,
);

router.delete(
  "/:id",
  requireRoles(UserRole.TENANT_ADMIN, UserRole.SUPER_ADMIN),
  deleteDepartmentController,
);

export default router;
