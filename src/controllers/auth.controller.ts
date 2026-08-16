import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body, req.ip);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId;
      const result = await authService.logout(userId, req.ip);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
