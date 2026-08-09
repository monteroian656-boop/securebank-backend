import { Request, Response } from "express";

export const usersController = {
  getAll: (_req: Request, res: Response) => {
    res.json({
      message: "GET users endpoint listo para implementar"
    });
  },

  getById: (req: Request, res: Response) => {
    res.json({
      message: "GET user by ID endpoint listo para implementar",
      id: req.params.id
    });
  },

  create: (_req: Request, res: Response) => {
    res.json({
      message: "CREATE user endpoint listo para implementar"
    });
  },

  update: (req: Request, res: Response) => {
    res.json({
      message: "UPDATE user endpoint listo para implementar",
      id: req.params.id
    });
  },

  delete: (req: Request, res: Response) => {
    res.json({
      message: "DELETE user endpoint listo para implementar",
      id: req.params.id
    });
  }
};