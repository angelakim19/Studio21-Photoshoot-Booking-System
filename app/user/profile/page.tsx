"use client"

import { useState } from "react"

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "09123456789",
    address: "Davao City, Philippines",
  })

  return (
    <div>
      {/* TITLE */}
      <h1 className="text-2xl font-serif mb-6">My Profile</h1>

      {/* PROFILE CARD */}
      <div className="bg-white p-6 rounded-xl shadow-sm max-w-lg space-y-5">

        {/* PROFILE HEADER */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl">
            M
          </div>

          <div>
            <p className="font-semibold text-lg">{user.name}</p>
            <p className="text-sm text-gray-500">Client</p>
          </div>
        </div>

        {/* FORM */}
        <div className="space-y-4">

          {/* NAME */}
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              className="w-full border p-2 rounded mt-1"
              value={user.name}
              onChange={(e) =>
                setUser({ ...user, name: e.target.value })
              }
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              className="w-full border p-2 rounded mt-1"
              value={user.email}
              onChange={(e) =>
                setUser({ ...user, email: e.target.value })
              }
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm text-gray-600">Phone</label>
            <input
              className="w-full border p-2 rounded mt-1"
              value={user.phone}
              onChange={(e) =>
                setUser({ ...user, phone: e.target.value })
              }
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="text-sm text-gray-600">Address</label>
            <input
              className="w-full border p-2 rounded mt-1"
              value={user.address}
              onChange={(e) =>
                setUser({ ...user, address: e.target.value })
              }
            />
          </div>

        </div>

        {/* SAVE BUTTON */}
        <button className="bg-[#C8A96A] text-white px-4 py-2 rounded w-full">
          Save Changes
        </button>

      </div>
    </div>
  )
}