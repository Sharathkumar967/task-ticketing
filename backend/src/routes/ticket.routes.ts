import express, { Router } from "express";
import {
  createTicket,
  editTicket,
  getAllTickets,
  getAssignedTickets,
  getTicketById,
  updateTicketStatus,
} from "../controllers/ticket.controller";
import { authenticateUser } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router: Router = express.Router();

router.post(
  "/create",
  authenticateUser as any,
  authorizeRoles("ADMIN") as any,
  createTicket as any
);

// Users/Admin can update their ticket status
router.put(
  "/update-status",
  authenticateUser as any,
  updateTicketStatus as any
);

// Get all tickets
router.get(
  "/allTickets",
  authenticateUser as any,
  authorizeRoles("ADMIN") as any,
  getAllTickets as any
);

// Get assigned tickets
router.get(
  "/my-tickets",
  authenticateUser as any,
  authorizeRoles("USER", "ADMIN") as any,
  getAssignedTickets as any
);

router.get(
  "/details/:id",
  authenticateUser as any,
  authorizeRoles("USER", "ADMIN") as any,
  getTicketById as any
);

router.put(
  "/edit/:id",
  authenticateUser as any,
  authorizeRoles("ADMIN") as any,
  editTicket as any
);

export default router;
