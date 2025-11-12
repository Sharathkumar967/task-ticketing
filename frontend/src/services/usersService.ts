import apiClient from "../api/apiClient";
import { apiEndpoints } from "../api/apiEndpoints";
import { getAllUsersResponse } from "../types/apiServices";

export const getAllUsersService = async (): Promise<{
  data: getAllUsersResponse;
}> => {
  const response = await apiClient.get(apiEndpoints.GET_ALL_USERS);
  return response;
};
