import { Request, Response, NextFunction } from "express";
import { usersService } from "../services/users.service";

export const usersController = {
  getAll: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await usersService.getAll();
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await usersService.getById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newUser = await usersService.create(req.body, req.body.performedBy);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updatedUser = await usersService.update(req.params.id, req.body, req.body.performedBy);
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado para actualizar" });
      }
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const success = await usersService.delete(req.params.id, req.body.performedBy);
      res.json({ success, message: "Usuario eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  }
};
