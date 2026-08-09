import { Request, Response } from "express";

export const authController = {
  login: (_req: Request, res: Response) => {
    res.json({
      message: "Login endpoint listo para implementar"
    });
  },

  logout: (_req: Request, res: Response) => {
    res.json({
      message: "Logout endpoint listo para implementar"
    });
  }
};