import api from "./api";

export const listBreedingRecords = async () => (await api.get("/breeding")).data.data ?? [];
export const createBreedingRecord = async (record) => (await api.post("/breeding", record)).data;
export const updateBreedingStatus = async (id, status, notes) => (await api.put(`/breeding/${id}/status`, { status, notes })).data;
export const updateBreedingRecord = async (id, record) => (await api.put(`/breeding/${id}`, record)).data;
export const deleteBreedingRecord = async (id) => (await api.delete(`/breeding/${id}`)).data;
export const registerCalf = async (id, calf) => (await api.post(`/breeding/${id}/calf`, calf)).data;
