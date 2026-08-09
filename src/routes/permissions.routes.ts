import { Router } from "express";
import { permissionsController } from "../controllers/permissions.controller";

const router = Router();

router.get("/", permissionsController.getAll);
router.get("/:id", permissionsController.getById);
router.post("/", permissionsController.create);
router.put("/:id", permissionsController.update);
router.delete("/:id", permissionsController.delete);

export default router;