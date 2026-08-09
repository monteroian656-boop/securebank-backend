import { Request, Response } from "express";

export const auditController = {
  getAll: (_req: Request, res: Response) => {
    res.json({
      message: "GET audit logs endpoint listo para implementar"
    });
  },

  getById: (req: Request, res: Response) => {
    res.json({
      message: "GET audit log by ID endpoint listo para implementar",
      id: req.params.id
    });
  }
};