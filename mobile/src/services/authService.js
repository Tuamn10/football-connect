import apiClient from "./apiClient";

export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post("/api/v1/auth/forgot-password", {
      email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (payload) => {
  try {
    const response = await apiClient.post("/api/v1/auth/reset-password", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
