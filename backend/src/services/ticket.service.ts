import prisma from "../config/prisma.config";
import { TicketStatus, TicketOverallStatus } from "@prisma/client";

// Create ticket
export const createTicketService = async (
  title: string,
  description: string | null,
  dueDate: string | null,
  createdById: string,
  assignedToIds: string[]
) => {
  return prisma.ticket.create({
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
      creator: true,
      assignments: { include: { user: true } },
    },
  });
};

// Update overall ticket status (Admin/User)
export const updateTicketOverallStatusService = async (
  ticketId: string,
  status: TicketOverallStatus
) => {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: { overallStatus: status },
    include: { assignments: { include: { user: true } } },
  });
};

// Update individual assignment (User)
export const updateUserAssignmentStatusService = async (
  assignmentId: string,
  status: TicketStatus
) => {
  return prisma.ticketAssignment.update({
    where: { id: assignmentId },
    data: { status },
    include: { ticket: true },
  });
};

// Fetch assigned tickets
export const fetchAssignedTicketsService = (userId: string) => {
  return prisma.ticket.findMany({
    where: { assignments: { some: { userId } } },
    orderBy: { createdAt: "desc" },
    include: { creator: true, assignments: { include: { user: true } } },
  });
};

// Fetch all tickets (Admin dashboard)
export const fetchAllTicketsService = (userId: string) => {
  return prisma.ticket.findMany({
    where: {
      OR: [{ createdById: userId }, { assignments: { some: { userId } } }],
    },
    orderBy: { createdAt: "desc" },
    include: { creator: true, assignments: { include: { user: true } } },
  });
};

// Fetch ticket by ID
export const fetchTicketByIdService = (id: string) => {
  return prisma.ticket.findUnique({
    where: { id },
    include: { creator: true, assignments: { include: { user: true } } },
  });
};

// Fetch all assignments for ticket
export const fetchTicketAssignmentsService = (ticketId: string) => {
  return prisma.ticketAssignment.findMany({ where: { ticketId } });
};

// Edit ticket
export const editTicketService = async (
  id: string,
  data: any,
  assignedIds?: string[]
) => {
  if (assignedIds) {
    data.assignments = {
      deleteMany: {},
      create: assignedIds.map((userId) => ({
        userId,
        status: TicketStatus.PENDING,
      })),
    };
  }

  return prisma.ticket.update({
    where: { id },
    data,
    include: { creator: true, assignments: { include: { user: true } } },
  });
};
