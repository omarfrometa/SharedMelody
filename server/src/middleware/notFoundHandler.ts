import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Ruta no encontrada: ${req.method} ${req.path}`
    },
    timestamp: new Date().toISOString(),
    path: req.path
  });
};
