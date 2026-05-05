// app/admin/clients/[id]/edit/page.tsx

import { supabase } from "@/lib/supabaseClient"
import EditClientForm from "./EditClientForm"

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // 🔹 Fetch single user from Supabase
  const { data: client, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !client) {
    return <div className="p-6">Client not found</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-serif mb-6">
        Edit Client: {client.first_name} {client.last_name}
      </h1>

      <EditClientForm client={client} />
    </div>
  )
}