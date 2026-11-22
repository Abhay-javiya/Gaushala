import api from "./api";
import { getDailyMilkSummary } from "./milkService";

export const getReportData = async (date) => {
  const month = date.slice(0, 7);
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(`${date}T00:00:00`);
    day.setDate(day.getDate() - (6 - index));
    return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
  });
  const [animals, breeding, monthly, daily] = await Promise.allSettled([
    api.get("/animals"), api.get("/breeding"), api.get(`/milk/summary/monthly/${month}`),
    Promise.all(days.map((day) => getDailyMilkSummary(day)))
  ]);
  return {
    animals: animals.status === "fulfilled" ? animals.value.data.data ?? [] : null,
    breeding: breeding.status === "fulfilled" ? breeding.value.data.data ?? [] : null,
    monthly: monthly.status === "fulfilled" ? monthly.value.data : null,
    daily: daily.status === "fulfilled" ? daily.value : null,
    errors: [animals, breeding, monthly, daily].filter((item) => item.status === "rejected")
  };
};
