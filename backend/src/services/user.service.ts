import { UserRole } from "@prisma/client";
import { prisma } from "../config/database";

interface SyncUserInput {
  cognitoUserId: string;
  email: string;
}

const DEFAULT_TENANT_ID = "11111111-1111-1111-1111-111111111111";

export async function syncUser(input: SyncUserInput) {
  return prisma.user.upsert({
    where: {
      cognitoUserId: input.cognitoUserId,
    },

    update: {
      email: input.email,
    },

    create: {
      cognitoUserId: input.cognitoUserId,
      email: input.email,
      tenantId: DEFAULT_TENANT_ID,
      role: UserRole.USER,
    },
  });
}
