import { Request, Response, NextFunction } from "express";
import { permissionsService } from "../services/permissions.service";

export const permissionsController = {
  getAll: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const permissions = await permissionsService.getAll();
      res.json(permissions);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permission = await permissionsService.getById(req.params.id);
      if (!permission) {
        return res.status(404).json({ message: "Permiso no encontrado" });
      }
      res.json(permission);
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newPermission = await permissionsService.create(req.body);
      res.status(201).json(newPermission);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedPermission = await permissionsService.update(req.params.id, req.body);
      if (!updatedPermission) {
        return res.status(404).json({ message: "Permiso no encontrado para actualizar" });
      }
      res.json(updatedPermission);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const success = await permissionsService.delete(req.params.id);
      res.json({ success, message: "Permiso eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  }
};

