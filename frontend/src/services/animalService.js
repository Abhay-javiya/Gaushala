import api from "./api";

export const listAnimals = async () => (await api.get("/animals")).data.data ?? [];
export const getAnimal = async (id) => (await api.get(`/animals/${id}`)).data.data;
export const createAnimal = async (animal) => (await api.post("/animals", animal)).data;
export const updateAnimal = async (id, animal) => (await api.put(`/animals/${id}`, animal)).data;
export const deleteAnimal = async (id) => (await api.delete(`/animals/${id}`)).data;
export const getAnimalMilkHistory = async (id) => (await api.get(`/milk/animal/${id}`)).data.data ?? [];
export const getAnimalBreedingHistory = async (id) => (await api.get(`/breeding/mother/${id}`)).data.data ?? [];
