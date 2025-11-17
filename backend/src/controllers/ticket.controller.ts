import { Response } from "express";
import { AuthenticatedRequest } from "../types/express.d";
import { TicketStatus, TicketOverallStatus } from "@prisma/client";
import {
  createTicketService,
  updateTicketOverallStatusService,
  updateUserAssignmentStatusService,
  fetchAssignedTicketsService,
  fetchAllTicketsService,
  fetchTicketByIdService,
  fetchTicketAssignmentsService,
  editTicketService,
} from "../services/ticket.service";
import prisma from "../config/prisma.config";
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

    const ticket = await createTicketService(
      title,
      description,
      dueDate,
      createdById,
      assignedToIds
    );

    return success(res, ticket, "Ticket created successfully.", 200);
  } catch (err) {
    console.error("Error creating ticket:", err);
    return error(res, "Internal server error.", 500);
  }
};

// UPDATE TICKET STATUS (USER + ADMIN)
export const updateTicketStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { ticketId, status, userId, userRole } = req.body;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { assignments: true },
    });
    if (!ticket) return error(res, "Ticket not found.", 404);

    // ADMIN FLOW
    if (userRole === "ADMIN") {
      const allowedStatuses: TicketOverallStatus[] = [
        "OPEN",
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
        "CLOSED",
      ];

      if (!allowedStatuses.includes(status))
        return error(res, `Invalid admin status: ${status}`, 400);

      const updatedTicket = await updateTicketOverallStatusService(
        ticketId,
        status
      );

      return success(
        res,
        updatedTicket,
        "Ticket overall status updated successfully.",
        200
      );
    }

    // USER FLOW
    if (!userId) return error(res, "userId is required.", 400);

    const assignment = await prisma.ticketAssignment.findFirst({
      where: { ticketId, userId },
    });

    if (!assignment)
      return error(res, "Assignment not found for this user.", 404);

    const allowedUserStatuses: TicketStatus[] = [
      "PENDING",
      "IN_PROGRESS",
      "COMPLETED",
    ];

    if (!allowedUserStatuses.includes(status))
      return error(res, "Invalid user status.", 400);

    const updatedAssignment = await updateUserAssignmentStatusService(
      assignment.id,
      status
    );

    const allAssignments = await fetchTicketAssignmentsService(ticketId);

    // UPDATED LOGIC
    const allCompleted = allAssignments.every(
      (a) => a.status === TicketStatus.COMPLETED
    );
    const anyInProgressOrCompleted = allAssignments.some(
      (a) =>
        a.status === TicketStatus.IN_PROGRESS ||
        a.status === TicketStatus.COMPLETED
    );

    let finalStatus: TicketOverallStatus;
    if (allCompleted) finalStatus = TicketOverallStatus.COMPLETED;
    else if (anyInProgressOrCompleted)
      finalStatus = TicketOverallStatus.IN_PROGRESS;
    else finalStatus = TicketOverallStatus.PENDING;

    const finalTicket = await updateTicketOverallStatusService(
      ticketId,
      finalStatus
    );

    return success(
      res,
      {
        assignment: updatedAssignment,
        overallStatus: finalTicket.overallStatus,
      },
      "Assignment updated successfully.",
      200
    );
  } catch (err) {
    console.error("[updateTicketStatus] Error:", err);
    return error(res, "Internal server error.", 500);
  }
};

// GET ALL TICKETS (ADMIN)
export const getAllTickets = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (req.user?.role !== "ADMIN")
      return error(res, "Forbidden: Admin access required.", 403);

    const tickets = await fetchAllTicketsService(req.user.id!);

    return success(
      res,
      { total: tickets.length, tickets },
      "Tickets fetched successfully.",
      200
    );
  } catch (err) {
    return error(res, "Internal server error.", 500);
  }
};

// GET ASSIGNED TICKETS (USER)
export const getAssignedTickets = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const tickets = await fetchAssignedTicketsService(userId!);

    return success(
      res,
      { total: tickets.length, tickets },
      "Assigned tickets fetched successfully.",
      200
    );
  } catch (err) {
    return error(res, "Failed to fetch assigned tickets.", 500);
  }
};

// GET TICKET BY ID
export const getTicketById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const ticket = await fetchTicketByIdService(req.params.id);
    if (!ticket) return error(res, "Ticket not found.", 404);
    return success(res, ticket, "Ticket fetched.", 200);
  } catch {
    return error(res, "Failed to fetch ticket.", 500);
  }
};

// EDIT TICKET
export const editTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, assignedToIds } = req.body;

    const data: any = {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    };

    const updated = await editTicketService(id, data, assignedToIds);

    return success(res, updated, "Ticket updated successfully.", 200);
  } catch (err) {
    return error(res, "Failed to update ticket.", 500);
  }
};
