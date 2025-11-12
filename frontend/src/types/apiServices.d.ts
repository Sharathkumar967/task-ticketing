export type loginParams = {
  email: string;
  password: string;
};

export type registerParams = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export type createTicketParams = {
  description: string;
  dueDate?: string;
  title: string;
  assignedToIds: string[];
};

export type editTicketParams = {
  id: string;
  description: string;
  dueDate?: string;
  title: string;
  assignedToIds: string[];
};

export type updateTicketStatusParams = {
  ticketId: string;
  status: string;
  userId?: string; // Optional field for admin actions on behalf of users
};

///// responses
export type authResponse = {
  status: number;
  message: string;
  accessToken: string;
  refreshToken: string;
};

export interface userResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface getAllTicketsResponse {
  status: number;
  message: string;
  data: {
    total: number;
    tickets: ticket[];
  };
}

export interface getMyTicketsResponse {
  status: number;
  message: string;
  data: {
    total: number;
    tickets: ticket[];
  };
}

export interface createTicketResponse {
  status: number;
  message: string;
}

export interface editTicketResponse {
  status: number;
  message: string;
}

export interface getAllUsersResponse {
  status: number;
  message: string;
  total: number;
  data: userResponse[];
}

export interface getTicketDetailsByIdResponse {
  status: number;
  message: string;
  data: ticket;
}

export interface updateTicketStatusResponse {
  status: number;
  message: string;
}

// interfaces
export interface ticket {
  id: string;
  title: string;
  description: string;
  createdById: string;
  dueDate: string;
  overallStatus: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  assignments?: {
    id: string;
    userId: string;
    ticketId: string;
    status: string;
    updatedAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];
}
