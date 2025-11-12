// controllers/ticket.controller.ts
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

    if (!title) {
      return error(res, "Title is required.", 400);
    }
    if (!Array.isArray(assignedToIds) || assignedToIds.length === 0) {
      return error(res, "assignedToIds must be a non-empty array.", 400);
    }
    if (!createdById) {
      return error(res, "Authentication required.", 401);
    }

    const users = await prisma.user.findMany({
      where: { id: { in: assignedToIds } },
    });

    if (users.length !== assignedToIds.length) {
      return error(res, "One or more assigned users not found.", 400);
    }

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

    return success(res, ticket, "Ticket created successfully.", 201);
  } catch (err: any) {
    console.error("Error creating ticket:", err);
    return error(res, "Internal server error.", 500);
  }
};

// UPDATE TICKET STATUS
interface UpdateTicketStatusBody {
  ticketId: string;
  status: string;
}

export const updateTicketStatus = async (
  req: AuthenticatedRequest & { body: UpdateTicketStatusBody },
  res: Response
) => {
  try {
    const { ticketId, status } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!ticketId || !status) {
      return error(res, "ticketId and status are required.", 400);
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { assignments: true },
    });

    if (!ticket) {
      return error(res, "Ticket not found.", 404);
    }

    // ADMIN: Direct overall status update
    if (userRole === "ADMIN") {
      const validAdminStatuses = ["OPEN", "CLOSED", "COMPLETED", "IN_PROGRESS"];
      if (!validAdminStatuses.includes(status)) {
        return error(
          res,
          `Admins can only set status to: ${validAdminStatuses.join(", ")}.`,
          400
        );
      }

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

      return success(res, updatedTicket, `Ticket marked as ${status}.`, 200);
    }

    // USER: Must be assigned
    const assignment = ticket.assignments.find((a) => a.userId === userId);
    if (!assignment) {
      return error(res, "You are not assigned to this ticket.", 403);
    }

    if (!Object.values(TicketStatus).includes(status as TicketStatus)) {
      return error(
        res,
        `Invalid status. Must be one of: ${Object.values(TicketStatus).join(
          ", "
        )}.`,
        400
      );
    }

    await prisma.ticketAssignment.updateMany({
      where: { ticketId, userId },
      data: { status: status as TicketStatus },
    });

    const allAssignments = await prisma.ticketAssignment.findMany({
      where: { ticketId },
    });

    let newOverallStatus: TicketOverallStatus;
    if (allAssignments.every((a) => a.status === TicketStatus.COMPLETED)) {
      newOverallStatus = TicketOverallStatus.COMPLETED;
    } else if (
      allAssignments.some((a) => a.status === TicketStatus.IN_PROGRESS)
    ) {
      newOverallStatus = TicketOverallStatus.IN_PROGRESS;
    } else {
      newOverallStatus = TicketOverallStatus.OPEN;
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { overallStatus: newOverallStatus },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignments: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return success(
      res,
      updatedTicket,
      `Your status updated to ${status}.`,
      200
    );
  } catch (err: any) {
    console.error("Error updating ticket status:", err);
    return error(res, "Internal server error.", 500);
  }
};

// GET ALL TICKETS (ADMIN ONLY)
export const getAllTickets = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return error(res, "Forbidden: Admin access required.", 403);
    }

    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
    });

    return success(
      res,
      { total: tickets.length, tickets },
      "All tickets fetched successfully.",
      200
    );
  } catch (err: any) {
    console.error("Error fetching all tickets:", err);
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
    if (!userId) {
      return error(res, "Unauthorized.", 401);
    }

    const tickets = await prisma.ticket.findMany({
      where: { assignments: { some: { userId } } },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignments: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
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

    if (!id) {
      return error(res, "Ticket ID is required.", 400);
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignments: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!ticket) {
      return error(res, "Ticket not found.", 404);
    }

    if (userRole !== "ADMIN") {
      const isAssigned = ticket.assignments.some((a) => a.userId === userId);
      if (!isAssigned) {
        return error(res, "Access denied: Ticket not assigned to you.", 403);
      }
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

    if (!id) {
      return error(res, "Ticket ID is required.", 400);
    }

    if (req.user?.role !== "ADMIN") {
      return error(res, "Forbidden: Admin access required.", 403);
    }

    const existingTicket = await prisma.ticket.findUnique({ where: { id } });
    if (!existingTicket) {
      return error(res, "Ticket not found.", 404);
    }

    let validAssignedToIds: number[] | undefined;
    if (assignedToIds !== undefined) {
      if (!Array.isArray(assignedToIds) || assignedToIds.length === 0) {
        return error(res, "assignedToIds must be a non-empty array.", 400);
      }

      const users = await prisma.user.findMany({
        where: { id: { in: assignedToIds } },
      });

      if (users.length !== assignedToIds.length) {
        return error(res, "One or more assigned users not found.", 400);
      }

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
        assignments: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return success(res, updatedTicket, "Ticket updated successfully.", 200);
  } catch (err: any) {
    console.error("Error editing ticket:", err);
    return error(res, "Failed to update ticket.", 500);
  }
};
