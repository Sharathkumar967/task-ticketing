import express, { Router } from "express";
import { getAllUsers } from "../controllers/user.controller";
import { authenticateUser } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router: Router = express.Router();

router.get(
  "/allUsers",
  authenticateUser as any,
  authorizeRoles("ADMIN") as any,
  getAllUsers as any
);

export default router;
