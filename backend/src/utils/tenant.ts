import { Request } from "express";

export function getTenantId(req: Request): string {
  if (!req.auth) {
    throw new Error("Authentication context missing");
  }

  return req.auth.tenantId;
}
