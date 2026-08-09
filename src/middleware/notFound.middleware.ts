import { Request, Response } from "express";

export const notFoundMiddleware = (
  req: Request,
  res: Response
) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada",
    path: req.originalUrl
  });
};