import { prisma } from "../config/database";

interface CreateDepartmentInput {
  name: string;
}

interface UpdateDepartmentInput {
  name?: string;
}

export async function createDepartment(
  tenantId: string,
  input: CreateDepartmentInput,
) {
  const name = input.name.trim();

  if (!name) {
    throw new Error("Department name is required");
  }

  const existingDepartment = await prisma.department.findFirst({
    where: {
      tenantId,
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existingDepartment) {
    throw new Error("Department already exists");
  }

  return prisma.department.create({
    data: {
      name,
      tenantId,
    },
  });
}

export async function getDepartments(tenantId: string) {
  return prisma.department.findMany({
    where: {
      tenantId,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getDepartmentById(
  tenantId: string,
  departmentId: string,
) {
  return prisma.department.findFirst({
    where: {
      id: departmentId,
      tenantId,
    },
  });
}

export async function updateDepartment(
  tenantId: string,
  departmentId: string,
  input: UpdateDepartmentInput,
) {
  const department = await prisma.department.findFirst({
    where: {
      id: departmentId,
      tenantId,
    },
  });

  if (!department) {
    throw new Error("Department not found");
  }

  const name = input.name?.trim();

  if (!name) {
    throw new Error("Department name is required");
  }

  const existingDepartment = await prisma.department.findFirst({
    where: {
      tenantId,
      name: {
        equals: name,
        mode: "insensitive",
      },
      NOT: {
        id: departmentId,
      },
    },
  });

  if (existingDepartment) {
    throw new Error("Department already exists");
  }

  return prisma.department.update({
    where: {
      id: departmentId,
    },
    data: {
      name,
    },
  });
}

export async function deleteDepartment(tenantId: string, departmentId: string) {
  const department = await prisma.department.findFirst({
    where: {
      id: departmentId,
      tenantId,
    },
  });

  if (!department) {
    throw new Error("Department not found");
  }

  // Don't allow deleting a department that still has users/documents.
  const [usersCount, documentsCount] = await Promise.all([
    prisma.userDepartment.count({
      where: {
        departmentId,
      },
    }),
    prisma.document.count({
      where: {
        departmentId,
      },
    }),
  ]);

  if (usersCount > 0 || documentsCount > 0) {
    throw new Error(
      "Cannot delete department because users or documents are assigned to it",
    );
  }

  return prisma.department.delete({
    where: {
      id: departmentId,
    },
  });
}
