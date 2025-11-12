import apiClient from "../api/apiClient";
import { apiEndpoints } from "../api/apiEndpoints";
import {
  loginParams,
  registerParams,
  authResponse,
  userResponse,
} from "../types/apiServices";

export const loginService = async (
  params: loginParams
): Promise<{ data: authResponse }> => {
  const response = await apiClient.post(apiEndpoints.LOGIN, params);
  return response;
};

export const registerService = async (
  params: registerParams
): Promise<{ data: authResponse }> => {
  const response = await apiClient.post(apiEndpoints.REGISTER, params);
  console.log("response", response);
  return response;
};

export const getUserProfileService = async (): Promise<{
  data: userResponse;
}> => {
  const response = await apiClient.get(apiEndpoints.ME);
  return response.data;
};
