import { Request, Response, NextFunction } from "express";
import { auditService } from "../services/audit.service";

export const auditController = {
  getAll: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await auditService.getAll();
      res.json(logs);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const log = await auditService.getById(req.params.id);
      if (!log) {
        return res.status(404).json({ message: "Registro de auditoría no encontrado" });
      }
      res.json(log);
    } catch (error) {
      next(error);
    }
  }
};

