import { Router } from "express";
import { rolesController } from "../controllers/roles.controller";

const router = Router();

router.get("/", rolesController.getAll);
router.get("/:id", rolesController.getById);
router.post("/", rolesController.create);
router.put("/:id", rolesController.update);
router.delete("/:id", rolesController.delete);

export default router;