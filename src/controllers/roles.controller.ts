import { Request, Response, NextFunction } from "express";
import { rolesService } from "../services/roles.service";

export const rolesController = {
  getAll: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const roles = await rolesService.getAll();
      res.json(roles);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = await rolesService.getById(req.params.id);
      if (!role) {
        return res.status(404).json({ message: "Rol no encontrado" });
      }
      res.json(role);
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newRole = await rolesService.create(req.body);
      res.status(201).json(newRole);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedRole = await rolesService.update(req.params.id, req.body);
      if (!updatedRole) {
        return res.status(404).json({ message: "Rol no encontrado para actualizar" });
      }
      res.json(updatedRole);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const success = await rolesService.delete(req.params.id);
      res.json({ success, message: "Rol eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  }
};

