import { Router } from "express";
import { auditController } from "../controllers/audit.controller";

const router = Router();

router.get("/", auditController.getAll);
router.get("/:id", auditController.getById);

export default router;