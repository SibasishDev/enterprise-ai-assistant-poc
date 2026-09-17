import { UserRole } from "@prisma/client";

export interface AuthContext {
  cognitoUserId: string;
  userId: string;
  tenantId: string;
  departmentIds: string[];
  role: UserRole;
  email: string;
}

export interface UserContext {
  cognitoUserId: string;
  email: string;
}
