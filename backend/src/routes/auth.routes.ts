import express from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  getUserProfile,
} from "../controllers/auth.controller";

import { authenticateUser } from "../middlewares/auth.middleware";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.get("/me", authenticateUser, getUserProfile);

export default router;
