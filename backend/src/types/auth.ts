import { UserRole } from "@prisma/client";

export interface AuthContext {
  cognitoUserId: string;
  userId: string;
  tenantId: string;
  role: UserRole;
  email: string;
}
