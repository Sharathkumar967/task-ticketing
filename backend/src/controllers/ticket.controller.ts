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
    const { ticketId, status, userId, userRole } = req.body;

    if (!ticketId || !status) {
      return res
        .status(400)
        .json({ message: "Ticket ID and status are required" });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { assignments: true },
    });

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // --- ADMIN FLOW ---
    if (userRole === "ADMIN") {
      const allowedStatuses: TicketOverallStatus[] = [
        "OPEN",
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
        "CLOSED",
      ];

      if (!allowedStatuses.includes(status as TicketOverallStatus)) {
        return res
          .status(400)
          .json({ message: `Invalid status for admin: ${status}` });
      }

      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { overallStatus: status as TicketOverallStatus },
        include: { assignments: { include: { user: true } } },
      });

      return res.status(200).json({
        message: "Ticket overall status updated successfully",
        data: updatedTicket,
      });
    }

    // --- USER FLOW ---
    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID required for assignment update" });
    }

    const assignment = await prisma.ticketAssignment.findFirst({
      where: { ticketId, userId },
    });

    if (!assignment) {
      return res
        .status(404)
        .json({ message: "Assignment not found for this user" });
    }

    // Users cannot set CLOSED
    const allowedUserStatuses: TicketStatus[] = [
      "PENDING",
      "IN_PROGRESS",
      "COMPLETED",
    ];
    if (!allowedUserStatuses.includes(status as TicketStatus)) {
      return res.status(400).json({
        message: `Users cannot set '${status}'. Only PENDING, IN_PROGRESS, or COMPLETED are allowed.`,
      });
    }

    // Update the user's assignment status
    const updatedAssignment = await prisma.ticketAssignment.update({
      where: { id: assignment.id },
      data: { status: status as TicketStatus },
      include: { ticket: true },
    });

    // Fetch all assignments to decide ticket overallStatus
    const allAssignments = await prisma.ticketAssignment.findMany({
      where: { ticketId },
    });

    const allCompleted = allAssignments.every(
      (a) => a.status === TicketStatus.COMPLETED
    );

    // Update ticket overallStatus only if all completed
    let updatedTicket = null;
    if (allCompleted) {
      updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { overallStatus: TicketOverallStatus.COMPLETED },
        include: { assignments: { include: { user: true } } },
      });
    } else {
      // If not all completed, optionally set overallStatus to IN_PROGRESS if any user started
      const anyInProgress = allAssignments.some(
        (a) => a.status === TicketStatus.IN_PROGRESS
      );
      if (anyInProgress) {
        updatedTicket = await prisma.ticket.update({
          where: { id: ticketId },
          data: { overallStatus: TicketOverallStatus.IN_PROGRESS },
          include: { assignments: { include: { user: true } } },
        });
      } else {
        // else keep as PENDING
        updatedTicket = await prisma.ticket.update({
          where: { id: ticketId },
          data: { overallStatus: TicketOverallStatus.PENDING },
          include: { assignments: { include: { user: true } } },
        });
      }
    }

    return res.status(200).json({
      message: "Assignment updated successfully",
      assignment: updatedAssignment,
      overallStatus: updatedTicket?.overallStatus,
    });
  } catch (err: any) {
    console.error("[updateTicketStatus] Error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
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

    const tickets = await prisma.ticket.findMany({
      where: { assignments: { some: { userId } } },
      orderBy: { createdAt: "desc" },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignments: { include: { user: true } },
      },
    });

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

    return success(res, updatedTicket, "Ticket updated successfully.", 200);
  } catch (err: any) {
    console.error("Error editing ticket:", err);
    return error(res, "Failed to update ticket.", 500);
  }
};
