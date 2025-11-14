import { Response } from "express";
import { AuthenticatedRequest } from "../types/express.d";
import prisma from "../config/prisma.config";
import { TicketStatus, TicketOverallStatus } from "@prisma/client";
import { success, error } from "../utils/response";

// CREATE TICKET
export const createTicket = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { title, description, dueDate, assignedToIds } = req.body;
    const createdById = req.user?.id;

    if (!title) return error(res, "Title is required.", 400);
    if (!Array.isArray(assignedToIds) || assignedToIds.length === 0)
      return error(res, "assignedToIds must be a non-empty array.", 400);
    if (!createdById) return error(res, "Authentication required.", 401);

    const users = await prisma.user.findMany({
      where: { id: { in: assignedToIds } },
    });
    if (users.length !== assignedToIds.length)
      return error(res, "One or more assigned users not found.", 400);

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById,
        assignments: {
          create: assignedToIds.map((userId) => ({
            userId,
            status: TicketStatus.PENDING,
          })),
        },
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignments: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    console.log("Ticket created:", ticket);
    return success(res, ticket, "Ticket created successfully.", 200);
  } catch (err: any) {
    console.error("Error creating ticket:", err);
    return error(res, "Internal server error.", 500);
  }
};

// UPDATE TICKET STATUS
export const updateTicketStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    console.log("[updateTicketStatus] Incoming request:", req.body);

    const { ticketId, status, userId, userRole } = req.body;
    if (!ticketId || !status) {
      console.log("Missing required fields");
      return res.status(400).json({
        status: 400,
        message: "Ticket ID and status are required",
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { assignments: true },
    });

    if (!ticket) {
      console.log("Ticket not found:", ticketId);
      return res.status(404).json({
        status: 404,
        message: "Ticket not found",
      });
    }

    console.log("Current ticket overall status:", ticket.overallStatus);

    // ADMIN flow
    if (userRole === "ADMIN") {
      console.log(`Updating ticket ${ticketId} to ${status}`);
      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { overallStatus: status as TicketOverallStatus },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          assignments: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });

      console.log("Ticket updated:", updatedTicket.id);
      return res.status(200).json({
        status: 200,
        message: "Ticket updated successfully",
        data: updatedTicket,
      });
    }

    // USER flow
    console.log("Updating assignment for user:", userId);
    const assignment = await prisma.ticketAssignment.findFirst({
      where: { ticketId, userId },
    });

    if (!assignment) {
      console.log("Assignment not found for user:", userId);
      return res.status(404).json({
        status: 404,
        message: "Assignment not found for this user",
      });
    }

    const updatedAssignment = await prisma.ticketAssignment.update({
      where: { id: assignment.id },
      data: { status: status as TicketStatus },
      include: { ticket: true },
    });

    console.log(`Assignment updated → ${status}:`, updatedAssignment.id);

    // Fetch all assignments again
    const allAssignments = await prisma.ticketAssignment.findMany({
      where: { ticketId },
    });
    const allStatuses = allAssignments.map((a) => a.status);

    console.log("📊 All assignment statuses:", allStatuses);

    // ✅ Compute overall status based on all users’ progress
    let newOverallStatus: TicketOverallStatus;

    if (allStatuses.every((s) => s === "COMPLETED")) {
      newOverallStatus = "COMPLETED";
    } else if (
      allStatuses.some((s) => s === "IN_PROGRESS" || s === "COMPLETED")
    ) {
      // at least one user is working or done → still in progress
      newOverallStatus = "IN_PROGRESS";
    } else {
      // all are pending
      newOverallStatus = "PENDING";
    }

    console.log("Computed Overall Status:", newOverallStatus);

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { overallStatus: newOverallStatus },
    });

    console.log("Overall status synced to:", newOverallStatus);

    return res.status(200).json({
      status: 200,
      message: "Assignment and overall ticket updated successfully",
      data: updatedAssignment,
    });
  } catch (err: any) {
    console.error("[updateTicketStatus] Exception:", err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: err.message,
    });
  }
};

// GET ALL TICKETS (ADMIN ONLY)
export const getAllTickets = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "ADMIN")
      return error(res, "Forbidden: Admin access required.", 403);

    const userId = req.user?.id;
    if (!userId) return error(res, "User not authenticated.", 401);

    console.log("🔍 Fetching all tickets for admin:", userId);

    const tickets = await prisma.ticket.findMany({
      where: {
        OR: [{ createdById: userId }, { assignments: { some: { userId } } }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignments: { include: { user: true } },
      },
    });

    console.log(`Found ${tickets.length} tickets`);
    return success(
      res,
      { total: tickets.length, tickets },
      "Tickets fetched successfully.",
      200
    );
  } catch (err: any) {
    console.error("Error fetching tickets:", err);
    return error(res, "Internal server error.", 500);
  }
};

// GET ASSIGNED TICKETS
export const getAssignedTickets = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return error(res, "Unauthorized.", 401);

    console.log("🔍 Fetching tickets assigned to user:", userId);

    const tickets = await prisma.ticket.findMany({
      where: { assignments: { some: { userId } } },
      orderBy: { createdAt: "desc" },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignments: { include: { user: true } },
      },
    });

    console.log(`Found ${tickets.length} assigned tickets`);
    return success(
      res,
      { total: tickets.length, tickets },
      "Assigned tickets fetched successfully.",
      200
    );
  } catch (err: any) {
    console.error("Error fetching assigned tickets:", err);
    return error(res, "Failed to fetch assigned tickets.", 500);
  }
};

// GET TICKET BY ID
export const getTicketById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!id) return error(res, "Ticket ID is required.", 400);

    console.log("🔍 Fetching ticket by ID:", id);

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignments: { include: { user: true } },
      },
    });

    if (!ticket) return error(res, "Ticket not found.", 404);

    if (
      userRole !== "ADMIN" &&
      !ticket.assignments.some((a) => a.userId === userId)
    ) {
      return error(res, "Access denied: Ticket not assigned to you.", 403);
    }

    console.log("Ticket fetched successfully");
    return success(res, ticket, "Ticket fetched successfully.", 200);
  } catch (err: any) {
    console.error("Error fetching ticket by ID:", err);
    return error(res, "Failed to fetch ticket.", 500);
  }
};

// EDIT TICKET (ADMIN ONLY)
export const editTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, assignedToIds } = req.body;

    if (!id) return error(res, "Ticket ID is required.", 400);
    if (req.user?.role !== "ADMIN")
      return error(res, "Forbidden: Admin access required.", 403);

    console.log("🛠 Editing ticket:", id);

    const existingTicket = await prisma.ticket.findUnique({ where: { id } });
    if (!existingTicket) return error(res, "Ticket not found.", 404);

    let validAssignedToIds: number[] | undefined;
    if (assignedToIds !== undefined) {
      if (!Array.isArray(assignedToIds) || assignedToIds.length === 0)
        return error(res, "assignedToIds must be a non-empty array.", 400);

      const users = await prisma.user.findMany({
        where: { id: { in: assignedToIds } },
      });
      if (users.length !== assignedToIds.length)
        return error(res, "One or more assigned users not found.", 400);

      validAssignedToIds = assignedToIds;
    }

    const updateData: any = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    };

    if (validAssignedToIds) {
      updateData.assignments = {
        deleteMany: {},
        create: validAssignedToIds.map((userId) => ({
          userId,
          status: TicketStatus.PENDING,
        })),
      };
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignments: { include: { user: true } },
      },
    });

    console.log("Ticket updated successfully");
    return success(res, updatedTicket, "Ticket updated successfully.", 200);
  } catch (err: any) {
    console.error("Error editing ticket:", err);
    return error(res, "Failed to update ticket.", 500);
  }
};
