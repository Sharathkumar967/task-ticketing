import { Request, Response } from "express";
import prisma from "../config/prisma.config";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });
    return res.status(200).json({
      status: 200,
      message: "Users fetched successfully",
      total: users.length,
      data: users,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error" });
  }
};
