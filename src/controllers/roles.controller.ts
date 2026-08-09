import { Request, Response } from "express";

export const rolesController = {
  getAll: (_req: Request, res: Response) => {
    res.json({
      message: "GET roles endpoint listo para implementar"
    });
  },

  getById: (req: Request, res: Response) => {
    res.json({
      message: "GET role by ID endpoint listo para implementar",
      id: req.params.id
    });
  },

  create: (_req: Request, res: Response) => {
    res.json({
      message: "CREATE role endpoint listo para implementar"
    });
  },

  update: (req: Request, res: Response) => {
    res.json({
      message: "UPDATE role endpoint listo para implementar",
      id: req.params.id
    });
  },

  delete: (req: Request, res: Response) => {
    res.json({
      message: "DELETE role endpoint listo para implementar",
      id: req.params.id
    });
  }
};