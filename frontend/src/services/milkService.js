import api from "./api";

export const listMilkRecords = async (filters = {}) => (await api.get("/milk", { params: filters })).data.data ?? [];
export const getDailyMilkSummary = async (date) => (await api.get(`/milk/summary/daily/${date}`)).data;
export const getMonthlyMilkSummary = async (month) => (await api.get(`/milk/summary/monthly/${month}`)).data;
export const createMilkRecord = async (record) => (await api.post("/milk", record)).data;
export const updateMilkRecord = async (id, record) => (await api.put(`/milk/${id}`, record)).data;
export const deleteMilkRecord = async (id) => (await api.delete(`/milk/${id}`)).data;
