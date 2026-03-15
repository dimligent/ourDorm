import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import type {
  ApiResponse,
  LoginResponse,
  User,
  Member,
  Flag,
  Countdown,
  DormLog,
  CreateFlagRequest,
  CreateCountdownRequest,
  UpdateCountdownRequest,
  CreateLogRequest,
} from "../types";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("Authorization");
  if (token) {
    const value = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    config.headers.Authorization = value;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  },
);

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await api.request<T>(config);
  return response as T;
}

export const authApi = {
  register: (username: string, password: string) =>
    request<ApiResponse>({
      method: "post",
      url: "/auth/register",
      data: { username, password },
    }),

  login: (username: string, password: string) =>
    request<LoginResponse>({
      method: "post",
      url: "/auth/login",
      data: { username, password },
    }),

  getCurrentUser: () =>
    request<ApiResponse<User>>({ method: "get", url: "/auth/me" }),
};

export const memberApi = {
  getMembers: () =>
    request<ApiResponse<Member[]>>({ method: "get", url: "/members/getmembers" }),

  getMemberDetail: (id: number) =>
    request<ApiResponse<Member>>({
      method: "get",
      url: `/members/getMemberDetail?id=${id}`,
    }),

  addMember: (member: Partial<Member>) =>
    request<ApiResponse>({
      method: "post",
      url: "/members/addmembers",
      data: member,
    }),
};

export const flagApi = {
  createFlag: (data: CreateFlagRequest) =>
    request<ApiResponse>({ method: "post", url: "/flags/createFlag", data }),

  getFlags: () =>
    request<ApiResponse<Flag[]>>({ method: "get", url: "/flags/getFlags" }),

  getTrashFlags: () =>
    request<ApiResponse<Flag[]>>({ method: "get", url: "/flags/getTrashFlags" }),

  getFlagDetail: (id: number) =>
    request<ApiResponse<Flag>>({
      method: "get",
      url: `/flags/getFlagDetail?id=${id}`,
    }),

  checkinFlag: (flagId: number) =>
    request<ApiResponse>({
      method: "post",
      url: "/flags/checkinFlag",
      data: { id: flagId },
    }),

  deleteFlag: (id: number) =>
    request<ApiResponse>({
      method: "post",
      url: "/flags/deleteFlag",
      data: { id },
    }),

  restoreFlag: (id: number) =>
    request<ApiResponse>({
      method: "post",
      url: "/flags/restoreFlag",
      data: { id },
    }),
};

export const countdownApi = {
  createCountdown: (data: CreateCountdownRequest) =>
    request<ApiResponse>({
      method: "post",
      url: "/countdown/createCountdown",
      data,
    }),

  getCountdowns: () =>
    request<ApiResponse<Countdown[]>>({
      method: "get",
      url: "/countdown/getCountdowns",
    }),

  updateCountdown: (data: UpdateCountdownRequest) =>
    request<ApiResponse>({
      method: "post",
      url: "/countdown/updateCountdown",
      data,
    }),

  deleteCountdown: (id: number) =>
    request<ApiResponse>({
      method: "post",
      url: "/countdown/deleteCountdown",
      data: { id },
    }),
};

export const logApi = {
  createLog: (data: CreateLogRequest) =>
    request<ApiResponse>({ method: "post", url: "/logs/createLog", data }),

  getLogs: (id?: number) =>
    request<ApiResponse<DormLog[] | DormLog>>({
      method: "get",
      url: id !== undefined ? `/logs/getLogs?id=${id}` : "/logs/getLogs",
    }),

  deleteLog: (id: number) =>
    request<ApiResponse>({
      method: "post",
      url: "/logs/deleteLog",
      data: { id },
    }),
};

export default api;
