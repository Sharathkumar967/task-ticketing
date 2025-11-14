import apiClient from "../api/apiClient";

import {
  createTicketParams,
  createTicketResponse,
  editTicketParams,
  editTicketResponse,
  getAllTicketsResponse,
  getMyTicketsResponse,
  getTicketDetailsByIdResponse,
  updateTicketStatusParams,
  updateTicketStatusResponse,
} from "../types/apiServices";

import { apiEndpoints } from "../api/apiEndpoints";

export const getAllTicketsService = async (): Promise<{
  data: getAllTicketsResponse;
}> => {
  const response = await apiClient.get(apiEndpoints.GET_ALL_TICKETS);
  return response;
};

export const getMyTicketsService = async (): Promise<{
  data: getMyTicketsResponse;
}> => {
  const response = await apiClient.get(apiEndpoints.GET_MY_TICKETS);
  return response;
};

export const getTicketDetailsByIdService = async (
  id: string
): Promise<{ data: getTicketDetailsByIdResponse }> => {
  const response = await apiClient.get(
    apiEndpoints.GET_TICKET_DETAILS_BY_ID + "/" + id
  );
  return response;
};

export const createTicketService = async (
  params: createTicketParams
): Promise<{ data: createTicketResponse }> => {
  const response = await apiClient.post(apiEndpoints.CREATE_TICKET, params);
  return response;
};

export const editTicketService = async (
  params: editTicketParams
): Promise<{ data: editTicketResponse }> => {
  const response = await apiClient.put(
    apiEndpoints.EDIT_TICKET + "/" + params.id,
    params
  );
  return response;
};

export const updateTicketStatusService = async (
  params: updateTicketStatusParams
): Promise<{ data: updateTicketStatusResponse }> => {
  const response = await apiClient.put(
    apiEndpoints.UPDATE_TICKET_STATUS,
    params
  );
  return response;
};
