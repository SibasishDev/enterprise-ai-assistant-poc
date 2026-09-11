import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // 1. Imported the official driver adapter
import "dotenv/config"; // 2. Ensured environment variables are loaded for this standalone script

// 3. Instantiate the modern Driver Adapter wrapper directly
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL 
});

// 4. Pass the adapter to the PrismaClient constructor
const prisma = new PrismaClient({ adapter });

async function main() {
  const tenantA = await prisma.tenant.upsert({
    where: { id: "11111111-1111-1111-1111-111111111111" },
    update: {},
    create: {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Acme Corporation"
    }
  });

  const tenantB = await prisma.tenant.upsert({
    where: { id: "22222222-2222-2222-2222-222222222222" },
    update: {},
    create: {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Globex Corporation"
    }
  });

  await prisma.user.upsert({
    where: { cognitoUserId: "cognito-user-a" },
    update: {},
    create: {
      cognitoUserId: "cognito-user-a",
      email: "admin@acme.example",
      role: UserRole.TENANT_ADMIN,
      tenantId: tenantA.id
    }
  });

  await prisma.user.upsert({
    where: { cognitoUserId: "cognito-user-b" },
    update: {},
    create: {
      cognitoUserId: "cognito-user-b",
      email: "admin@globex.example",
      role: UserRole.TENANT_ADMIN,
      tenantId: tenantB.id
    }
  });

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
