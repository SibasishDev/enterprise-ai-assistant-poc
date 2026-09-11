import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/me", authenticate, (req, res) => {
  return res.json({
    success: true,
    user: req.auth,
  });
});

export default router;
