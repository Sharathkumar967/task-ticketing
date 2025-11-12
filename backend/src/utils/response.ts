import { Response } from "express";

export const success = <T = any>(
  res: Response,
  data: T,
  message: string,
  status = 200
): Response => {
  return res.status(status).json({
    status,
    message,
    data,
  });
};

export const error = (
  res: Response,
  message: string,
  status: number
): Response => {
  return res.status(status).json({
    status,
    message,
  });
};
