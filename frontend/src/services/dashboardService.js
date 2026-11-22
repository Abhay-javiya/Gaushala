import api from "./api";

export const getDashboardData = async (date) => {
  const [animalsResult, milkResult, breedingResult] = await Promise.allSettled([
    api.get("/animals"),
    api.get(`/milk/summary/daily/${date}`),
    api.get("/breeding")
  ]);

  return {
    animals: animalsResult.status === "fulfilled"
      ? animalsResult.value.data.data ?? []
      : null,
    milk: milkResult.status === "fulfilled"
      ? milkResult.value.data
      : null,
    breeding: breedingResult.status === "fulfilled"
      ? breedingResult.value.data.data ?? []
      : null,
    errors: [animalsResult, milkResult, breedingResult]
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason)
  };
};
