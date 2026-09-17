import { Request, Response } from "express";
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "../services/department.service";

export async function createDepartmentController(req: Request, res: Response) {
  try {
    const tenantId = req.auth!.tenantId;

    const department = await createDepartment(tenantId, req.body);

    return res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error("Create department error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to create department",
    });
  }
}

export async function getDepartmentsData(req: Request, res: Response) {
  try {
    const tenantId = req.auth!.tenantId;

    const departments = await getDepartments(tenantId);

    return res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
    });
  }
}

// export async function getDepartmentController(
//   req: Request,
//   res: Response
// ) {
//   try {
//     const tenantId = req.auth!.tenantId;
//     const { id } = req.params;

//     const department = await getDepartmentById(
//       tenantId,
//       id
//     );

//     if (!department) {
//       return res.status(404).json({
//         success: false,
//         message: "Department not found"
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: department
//     });
//   } catch (error) {
//     console.error("Get department error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch department"
//     });
//   }
// }

export async function updateDepartmentController(req: Request, res: Response) {
  try {
    const tenantId = req.auth!.tenantId;
    const { id } = req.params as { id: string };

    const department = await updateDepartment(tenantId, id, req.body);

    return res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error("Update department error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update department",
    });
  }
}

export async function deleteDepartmentController(req: Request, res: Response) {
  try {
    const tenantId = req.auth!.tenantId;
    const { id } = req.params as { id: string };

    await deleteDepartment(tenantId, id);

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Delete department error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete department",
    });
  }
}
