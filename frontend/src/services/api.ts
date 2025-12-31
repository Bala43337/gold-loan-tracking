import axios from "axios";
import type { Loan, AppSettings, CreateLoanDto } from "../types";

const API_URL = "https://gold-loan-tracking.onrender.com"; // Assuming backend runs on 3000

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  login: async (email: string, pass: string) => {
    const res = await axiosInstance.post<{ access_token: string }>(
      `/auth/login`,
      {
        email,
        password: pass,
      }
    );
    return res.data;
  },

  // Loans
  getLoans: async () => {
    const res = await axiosInstance.get<Loan[]>(`/loans`);
    return res.data;
  },
  getLoan: async (id: string) => {
    const res = await axiosInstance.get<Loan>(`/loans/${id}`);
    return res.data;
  },
  createLoan: async (data: CreateLoanDto) => {
    const res = await axiosInstance.post<Loan>(`/loans`, data);
    return res.data;
  },
  updateLoan: async (id: string, data: any) => {
    const res = await axiosInstance.patch<Loan>(`/loans/${id}`, data);
    return res.data;
  },
  deleteLoan: async (id: string) => {
    const res = await axiosInstance.delete(`/loans/${id}`);
    return res.data;
  },

  // Settings
  getSettings: async () => {
    const res = await axiosInstance.get<AppSettings>(`/settings`);
    return res.data;
  },
  updateSettings: async (data: Partial<AppSettings>) => {
    const res = await axiosInstance.patch<AppSettings>(`/settings`, data);
    return res.data;
  },
  fetchLiveRate: async () => {
    const res = await axiosInstance.post<{ marketGoldRate: number }>(
      `/settings/fetch-live`
    );
    return res.data;
  },

  // Simulation
  simulate: async (data: {
    availableCash: number;
    bankGoldRate: number;
    retentionPercent: number;
  }) => {
    const res = await axiosInstance.post<any>(`/simulate/loan-closure`, data);
    return res.data;
  },
};
