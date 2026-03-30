import axios from "axios";
import Constants from "expo-constants";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ?? "http://10.0.2.2:8080";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});
