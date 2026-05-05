"use client";

import { useState } from "react";
import Pagination from "./Pagination";

export default function AppointmentTable({ data }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // 📄 Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(start, start + itemsPerPage);

  // ✅ Bulk select
  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    const ids = paginatedData.map((item) => item.id);
    setSelected(ids);
  };

  const deleteSelected = () => {
    console.log("Delete IDs:", selected);
    // 👉 connect to Supabase delete later
  };

  return (
    <div>
      {/* 🔥 Bulk Actions */}
      <div className="flex gap-2 mb-2">
        <button onClick={selectAll} className="border px-2 py-1 rounded">
          Select All
        </button>

        <button
          onClick={deleteSelected}
          className="border px-2 py-1 rounded text-red-500"
        >
          Delete Selected
        </button>
      </div>

      {/* 📋 Table */}
      {paginatedData.map((item) => (
        <div key={item.id} className="flex gap-2 items-center border-b py-2">
          <input
            type="checkbox"
            checked={selected.includes(item.id)}
            onChange={() => toggleSelect(item.id)}
          />
          <span>{item.name}</span>
        </div>
      ))}

      {/* 📄 Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}