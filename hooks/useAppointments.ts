import { useState } from "react";

export function useAppointments(initialData: any[]) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("none"); // 👈 default = no sort
  const [statusFilter, setStatusFilter] = useState("all");

  let processedData = initialData

    // 🔍 SEARCH (always active)
    .filter((item) => {
      const query = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query)
      );
    })

    // 📌 FILTER
    .filter((item) => {
      if (statusFilter === "all") return true;
      return item.status.toLowerCase() === statusFilter;
    });

  // 🔽 SORT (only if NOT "none")
  if (sortBy !== "none") {
    processedData = [...processedData].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }

      if (sortBy === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }

      if (sortBy === "amount_high") {
        return b.total_price - a.total_price;
      }

      if (sortBy === "amount_low") {
        return a.total_price - b.total_price;
      }

      if (sortBy === "name_az") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "name_za") {
        return b.name.localeCompare(a.name);
      }

      return 0;
    });
  }

  return {
    search,
    setSearch,
    sortBy,
    setSortBy,
    statusFilter,
    setStatusFilter,
    data: processedData,
  };
}