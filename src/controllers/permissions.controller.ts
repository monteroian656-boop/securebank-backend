import { Request, Response } from "express";

export const permissionsController = {
  getAll: (_req: Request, res: Response) => {
    res.json({
      message: "GET permissions endpoint listo para implementar"
    });
  },

  getById: (req: Request, res: Response) => {
    res.json({
      message: "GET permission by ID endpoint listo para implementar",
      id: req.params.id
    });
  },

  create: (_req: Request, res: Response) => {
    res.json({
      message: "CREATE permission endpoint listo para implementar"
    });
  },

  update: (req: Request, res: Response) => {
    res.json({
      message: "UPDATE permission endpoint listo para implementar",
      id: req.params.id
    });
  },

  delete: (req: Request, res: Response) => {
    res.json({
      message: "DELETE permission endpoint listo para implementar",
      id: req.params.id
    });
  }
};