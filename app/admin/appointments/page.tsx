"use client"

import { useState, useEffect, useCallback } from "react"
import { Pencil, Trash2, Plus, Search, ChevronDown } from "lucide-react"
import EditAppointmentDialog from "@/components/admin/EditAppointmentDialog"
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal"
import { supabase } from "@/lib/supabaseClient"

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "approved" | "pending" | "cancelled"

type Appointment = {
  id: number
  firstName: string
  lastName: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  duration: number
  service: string        // display label shown in table
  serviceSlug: string    // slug stored in package_name_snapshot, used to pre-fill dialog
  serviceId?: number | null
  packageId?: number | null
  makeupServiceId?: number | null
  studioRentalOptionId?: number | null
  addons: { photographer: boolean; makeup: boolean }
  makeupPeople: number
  makeupOnlyPeople: number
  studioHours: number
  studioBackdrop: boolean
  photoshootSets: number
  totalPrice: number
  total_price: number
  status: Status
  paymentMethod?: string
  paymentReference?: string
  notes: string
}

const STANDARD_METHODS = ["gcash", "maya", "bank_transfer", "credit_card"]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusStyles: Record<Status, string> = {
  approved:  "bg-green-100 text-green-800",
  pending:   "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
}

const getEndTime = (time: string, duration: number) => {
  if (!time) return ""
  const [h, m] = time.split(":").map(Number)
  const d = new Date()
  d.setHours(h)
  d.setMinutes(m + duration)
  return d.toTimeString().slice(0, 5)
}

const SERVICE_LABELS: Record<string, string> = {
  studio_rental: "Studio Rental",
  pkg_a: "Package A - Indoor Set Design",
  pkg_b: "Package B - Plain Background",
  pkg_c: "Package C - Outdoor Shoot",
  photoshoot: "Photoshoot",
  makeup: "Makeup",
  "studio-rental": "Studio Rental",
  "Package A — Indoor Set Design": "Package A - Indoor Set Design",
  "Package B — Plain Background": "Package B - Plain Background",
  "Package C — Outdoor Shoot": "Package C - Outdoor Shoot",
  "Package A â€” Indoor Set Design": "Package A - Indoor Set Design",
  "Package B â€” Plain Background": "Package B - Plain Background",
  "Package C â€” Outdoor Shoot": "Package C - Outdoor Shoot",
}

const PACKAGE_LABELS: Record<number, string> = {
  1: "Package A - Indoor Set Design",
  2: "Package B - Plain Background",
  3: "Package C - Outdoor Shoot",
}

const getServiceTypeLabel = (serviceId: number | string | null | undefined) => {
  const id = Number(serviceId)
  if (id === 1) return "Photoshoot"
  if (id === 2) return "Makeup"
  if (id === 3) return "Studio Rental"
  return ""
}

const getBookingServiceLabel = (row: any) => {
  const snapshot = row.package_name_snapshot
  if (snapshot) return SERVICE_LABELS[snapshot] || snapshot

  if (row.package_id) return PACKAGE_LABELS[Number(row.package_id)] || "Photoshoot"
  if (row.makeup_service_id) return "Makeup"
  if (row.studio_rental_option_id) return "Studio Rental"

  const rawService = row.service
  if (rawService) return SERVICE_LABELS[rawService] || rawService

  return getServiceTypeLabel(row.service_id) || "—"
}

const getBookingServiceSlug = (row: any) => {
  const snapshot = row.package_name_snapshot
  if (snapshot) return snapshot

  if (row.package_id) {
    const packageIdToSlug: Record<number, string> = {
      1: "pkg_a",
      2: "pkg_b",
      3: "pkg_c",
    }
    return packageIdToSlug[Number(row.package_id)] || "photoshoot"
  }

  if (Number(row.service_id) === 3 || row.studio_rental_option_id) return "studio_rental"
  if (Number(row.service_id) === 2 || row.makeup_service_id) return "makeup"
  if (Number(row.service_id) === 1) return "photoshoot"

  return row.service || ""
}

// ─── Meta encoding/decoding ───────────────────────────────────────────────────
// All booking config (add-ons, studio options, etc.) is stored as a JSON block
// at the top of the notes column so we never need add_ons / booking_addons /
// makeup_services / packages / package_variations / studio_rental_options /
// services joins for reading back booking details.
//
// Format:  __meta__:{"photographer":true,...}\nOptional human notes

function parseMeta(raw: string | null): {
  photographer: boolean
  makeup: boolean
  makeupPeople: number
  makeupOnlyPeople: number
  studioHours: number
  studioBackdrop: boolean
  photoshootSets: number
  humanNotes: string
} {
  const defaults = {
    photographer: false, makeup: false, makeupPeople: 1, makeupOnlyPeople: 1,
    studioHours: 1, studioBackdrop: false, photoshootSets: 1, humanNotes: "",
  }
  if (!raw) return defaults
  const match = raw.match(/^__meta__:(\{.*?\})\n?([\s\S]*)$/s)
  if (!match) return { ...defaults, humanNotes: raw }
  try {
    const meta = JSON.parse(match[1])
    return {
      photographer:    !!meta.photographer,
      makeup:          !!meta.makeup,
      makeupPeople:    Number(meta.makeupPeople)    || 1,
      makeupOnlyPeople:Number(meta.makeupOnlyPeople)|| 1,
      studioHours:     Number(meta.studioHours)     || 1,
      studioBackdrop:  !!meta.studioBackdrop,
      photoshootSets:  Number(meta.photoshootSets)  || 1,
      humanNotes:      match[2].trim(),
    }
  } catch {
    return { ...defaults, humanNotes: raw }
  }
}

function buildNotes(
  meta: {
    photographer: boolean; makeup: boolean; makeupPeople: number
    makeupOnlyPeople: number; studioHours: number; studioBackdrop: boolean
    photoshootSets: number
  },
  humanNotes: string
): string {
  const metaStr = JSON.stringify(meta)
  return humanNotes.trim()
    ? `__meta__:${metaStr}\n${humanNotes.trim()}`
    : `__meta__:${metaStr}`
}

// ─── Supabase data helpers ────────────────────────────────────────────────────

/** Parse a DB datetime string as LOCAL (PH) time — strips any UTC/timezone suffix */
function parseLocalDt(raw: string | null | undefined): Date | null {
  if (!raw) return null
  // Strip timezone suffix so JS treats it as local time, not UTC
  const normalized = raw.replace(" ", "T").replace(/([+-]\d{2}:\d{2}|Z)$/, "")
  return new Date(normalized)
}

function mapRow(row: any): Appointment {
  const startDt = parseLocalDt(row.start_datetime)
  const endDt   = parseLocalDt(row.end_datetime)

  // Extract date and time from local Date (not UTC)
  const pad = (n: number) => String(n).padStart(2, "0")
  const date = startDt
    ? `${startDt.getFullYear()}-${pad(startDt.getMonth() + 1)}-${pad(startDt.getDate())}`
    : ""
  const time = startDt
    ? `${pad(startDt.getHours())}:${pad(startDt.getMinutes())}`
    : ""
  const duration = startDt && endDt
    ? Math.round((endDt.getTime() - startDt.getTime()) / 60000)
    : 60

  const payment = row.payments?.[0] ?? null
  const meta    = parseMeta(row.notes)
  const totalPrice = Number(row.total_price ?? 0)

  const firstName = row.users?.first_name ?? ""
  const lastName  = row.users?.last_name  ?? ""

  // package_name_snapshot stores the service slug
  // Slugs: "studio_rental" | "pkg_a" | "pkg_b" | "pkg_c"
  const serviceSlug = getBookingServiceSlug(row)

  const SERVICE_LABELS: Record<string, string> = {
    // admin slugs
    studio_rental: "Studio Rental",
<<<<<<< HEAD
    pkg_a: "Package A – Indoor Set Design",
    pkg_b: "Package B – Plain Background",
    pkg_c: "Package C – Outdoor Shoot",

    // user-side labels
    "Package A — Indoor Set Design": "Package A – Indoor Set Design",
    "Package B — Plain Background": "Package B – Plain Background",
    "Package C — Outdoor Shoot": "Package C – Outdoor Shoot",

    // makeup
    "Natural/Everyday Look": "Natural/Everyday Look",
    "Glamour/Evening": "Glamour/Evening",
    "Bridal Makeup": "Bridal Makeup",

    // studio rental packages
    "1 Hour — Basic Setup": "1 Hour — Basic Setup",
    "1 Hour — With Backdrop": "1 Hour — With Backdrop",

    "2 Hours — Basic Setup": "2 Hours — Basic Setup",
    "2 Hours — With Backdrop": "2 Hours — With Backdrop",

    "3 Hours — Basic Setup": "3 Hours — Basic Setup",
    "3 Hours — With Backdrop": "3 Hours — With Backdrop",

    "Half Day (4 hrs) — With Backdrop":
      "Half Day (4 hrs) — With Backdrop",

    "Full Day (8 hrs) — With Backdrop":
      "Full Day (8 hrs) — With Backdrop",
=======
    pkg_a:         "Package A – Indoor Set Design",
    pkg_b:         "Package B – Plain Background",
    pkg_c:         "Package C – Outdoor Shoot",
    makeup_only:   "Makeup Only",
>>>>>>> main
  }

  const serviceLabel = SERVICE_LABELS[serviceSlug] || getBookingServiceLabel(row)

  return {
    id: row.id,
    firstName,
    lastName,
    name:            `${firstName} ${lastName}`.trim() || "—",
    email:           row.users?.email ?? "",
    phone:           row.users?.phone ?? "",
    date,
    time,
    duration,
    service:         serviceLabel,
    serviceSlug,
<<<<<<< HEAD
    serviceId:      row.service_id ?? null,
    packageId:      row.package_id ?? null,
    makeupServiceId: row.makeup_service_id ?? null,
    studioRentalOptionId: row.studio_rental_option_id ?? null,
    addons:        { photographer: meta.photographer, makeup: meta.makeup },
    makeupPeople:  meta.makeupPeople,
    studioHours:   meta.studioHours,
    studioBackdrop:meta.studioBackdrop,
    photoshootSets:meta.photoshootSets,
=======
    addons:          { photographer: meta.photographer, makeup: meta.makeup },
    makeupPeople:    meta.makeupPeople,
    makeupOnlyPeople:meta.makeupOnlyPeople,
    studioHours:     meta.studioHours,
    studioBackdrop:  meta.studioBackdrop,
    photoshootSets:  meta.photoshootSets,
>>>>>>> main
    totalPrice,
    total_price:     totalPrice,
    status:          (row.status as Status) ?? "pending",
    paymentMethod:    payment?.payment_method    ?? undefined,
    paymentReference: payment?.payment_reference ?? undefined,
    notes: meta.humanNotes,
  }
}

async function fetchBookings(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      status,
      total_price,
      start_datetime,
      end_datetime,
      service_id,
      package_id,
      makeup_service_id,
      studio_rental_option_id,
      package_name_snapshot,
      notes,
      users ( first_name, last_name, email, phone ),
      payments ( payment_method, payment_reference, created_at )
    `)
    .order("start_datetime", { ascending: false })

  if (error) {
    console.error("fetchBookings:", error.message)
    return []
  }

  return (data ?? []).map((row: any) => {
    const sortedPayments = [...(row.payments ?? [])].sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    return mapRow({ ...row, payments: sortedPayments })
  })
}

async function updateStatusInDb(id: number, status: Status) {
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id)
  if (error) console.error("updateStatus:", error.message)
}

async function deleteBookingFromDb(id: number): Promise<boolean> {
  const deleteDirectly = async () => {
    const { error: paymentsError } = await supabase.from("payments").delete().eq("booking_id", id)
    if (paymentsError) {
      console.error("deleteBooking payments:", paymentsError.message)
      return false
    }

    const { error: addonsError } = await supabase.from("booking_addons").delete().eq("booking_id", id)
    if (addonsError) {
      console.error("deleteBooking addons:", addonsError.message)
      return false
    }

    const { error: bookingError } = await supabase.from("bookings").delete().eq("id", id)
    if (bookingError) {
      console.error("deleteBooking booking:", bookingError.message)
      return false
    }
    const { data: verifyRow, error: verifyError } = await supabase
      .from("bookings")
      .select("id")
      .eq("id", id)
      .maybeSingle()
    if (verifyError || verifyRow) {
      console.error("deleteBooking verify (direct):", verifyError?.message || "row still exists")
      return false
    }
    return true
  }

  // Remove Google Calendar event if one exists
  await fetch("/api/calendar/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId: id, action: "delete" }),
  }).catch(() => {}) // non-fatal if calendar API fails

  const {
    data: { session },
  } = await supabase.auth.getSession()
  const accessToken = session?.access_token
  if (!accessToken) {
    console.warn("deleteBooking: missing access token, using direct delete fallback")
    return await deleteDirectly()
  }

  const res = await fetch("/api/bookings/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ bookingId: id }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    console.error("deleteBooking API:", data?.error || `HTTP ${res.status}`)
    return await deleteDirectly()
  }

  // Verify API delete actually removed row from DB
  const { data: verifyRow, error: verifyError } = await supabase
    .from("bookings")
    .select("id")
    .eq("id", id)
    .maybeSingle()
  if (verifyError || verifyRow) {
    console.error("deleteBooking verify (api):", verifyError?.message || "row still exists")
    return await deleteDirectly()
  }

  return true
}

// ─── Relational table helpers ─────────────────────────────────────────────────
// These resolve IDs from the reference tables so we can write proper foreign keys.

/** Returns the service_id for a given service name (e.g. "Studio Rental") */
async function resolveServiceId(serviceName: string): Promise<number | null> {
  const { data } = await supabase
    .from("services")
    .select("id")
    .ilike("name", serviceName)
    .limit(1)
    .maybeSingle()
  return data?.id ?? null
}

/** Returns the package id for a slug like "pkg_a" by matching the name snapshot */
async function resolvePackageId(serviceId: number, packageName: string): Promise<number | null> {
  const { data } = await supabase
    .from("packages")
    .select("id")
    .eq("service_id", serviceId)
    .ilike("name", packageName)
    .limit(1)
    .maybeSingle()
  return data?.id ?? null
}

/** Returns the package_variation id for a given package + number_of_sets */
async function resolvePackageVariationId(packageId: number, numberOfSets: number): Promise<number | null> {
  const { data } = await supabase
    .from("package_variations")
    .select("id")
    .eq("package_id", packageId)
    .eq("number_of_sets", numberOfSets)
    .limit(1)
    .maybeSingle()
  return data?.id ?? null
}

/** Returns the studio_rental_option id matching service + duration type */
async function resolveStudioRentalOptionId(serviceId: number, duration: string): Promise<number | null> {
  const { data } = await supabase
    .from("studio_rental_options")
    .select("id")
    .eq("service_id", serviceId)
    .ilike("duration", duration)
    .limit(1)
    .maybeSingle()
  return data?.id ?? null
}

/** Returns the makeup_service id for the Studio Rental service */
async function resolveMakeupServiceId(serviceId: number): Promise<number | null> {
  const { data } = await supabase
    .from("makeup_services")
    .select("id")
    .eq("service_id", serviceId)
    .limit(1)
    .maybeSingle()
  return data?.id ?? null
}

/** Returns the add_on id for Photographer by name */
async function resolvePhotographerAddonId(): Promise<number | null> {
  const { data } = await supabase
    .from("add_ons")
    .select("id")
    .ilike("name", "%photographer%")
    .limit(1)
    .maybeSingle()
  return data?.id ?? null
}

/** Returns the add_on id for Makeup/Hair by name */
async function resolveMakeupAddonId(): Promise<number | null> {
  const { data } = await supabase
    .from("add_ons")
    .select("id")
    .ilike("name", "%makeup%")
    .limit(1)
    .maybeSingle()
  return data?.id ?? null
}

// Duration label mappings for studio_rental_options
const STUDIO_HOURS_TO_DURATION: Record<number, string> = {
  1: "1 Hour",
  2: "2 Hours",
  3: "3 Hours",
  4: "Half Day",
  8: "Full Day",
}

const PHOTOSHOOT_SLUG_TO_NAME: Record<string, string> = {
  pkg_a: "Package A",
  pkg_b: "Package B",
  pkg_c: "Package C",
}

/** Format a Date as "YYYY-MM-DD HH:MM:SS" in LOCAL (PH) time — no UTC conversion */
function toLocalDtString(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
    `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  )
}

// ─── Upsert booking (writes to both __meta__ notes AND relational tables) ─────

async function upsertBooking(
  form: {
    firstName: string; lastName: string; email: string; phone: string
    date: string; time: string; duration: number; service: string
    addons: { photographer: boolean; makeup: boolean }
    notes: string; paymentMethod: string; paymentReference: string
    paymentMethodOther: string; studioHours: number; studioBackdrop: boolean
    photoshootSets: number; makeupPeople: number; makeupOnlyPeople: number
  },
  calculatedPrice: number,
  editingId: number | null,
  existingStatus: Status
): Promise<number | null> {
  const timeStr = form.time && form.time.length === 5 ? form.time : "00:00"
  const startDt = new Date(`${form.date}T${timeStr}:00`)

  if (isNaN(startDt.getTime())) {
    console.error("upsertBooking: invalid date/time", form.date, form.time)
    return null
  }

  // Compute end datetime
  const isMakeupOnly   = form.service === "makeup_only"
  const makeupExtraMins = form.addons.makeup ? (form.makeupPeople ?? 1) * 60 : 0
  const baseMins = form.service === "studio_rental"
    ? (form.studioHours ?? 1) * 60
    : isMakeupOnly
      ? 60
      : form.duration  // dialog sets duration = sets × 120 for photoshoots
  const endDt = new Date(startDt.getTime() + (baseMins + makeupExtraMins) * 60000)

  const finalMethod = form.paymentMethod === "other"
    ? form.paymentMethodOther
    : form.paymentMethod

  // Encode all config into notes so we can restore it on next load
  const notesValue = buildNotes(
    {
      photographer:    form.addons.photographer,
      makeup:          form.addons.makeup,
      makeupPeople:    form.makeupPeople ?? 1,
      makeupOnlyPeople:form.makeupOnlyPeople ?? 1,
      studioHours:     form.studioHours ?? 1,
      studioBackdrop:  form.studioBackdrop,
      photoshootSets:  form.photoshootSets ?? 1,
    },
    form.notes
  )

  // ── Resolve relational IDs in background (non-blocking for the main save) ───
  const isStudioRental = form.service === "studio_rental"
  const isPhotoshoot   = ["pkg_a", "pkg_b", "pkg_c"].includes(form.service)
  // isMakeupOnly already declared above

  // Resolve service_id
  let serviceId: number | null = null
  let packageId: number | null = null
  let packageVariationId: number | null = null
  let studioRentalOptionId: number | null = null
  let makeupServiceId: number | null = null

  if (isStudioRental) {
    serviceId = await resolveServiceId("Studio Rental")
    if (serviceId) {
      const durationLabel = STUDIO_HOURS_TO_DURATION[form.studioHours ?? 1] ?? ""
      studioRentalOptionId = await resolveStudioRentalOptionId(serviceId, durationLabel)
      makeupServiceId      = await resolveMakeupServiceId(serviceId)
    }
  } else if (isPhotoshoot) {
    serviceId = await resolveServiceId("Photography")
    if (!serviceId) serviceId = await resolveServiceId("Photoshoot")
    if (serviceId) {
      const pkgName = PHOTOSHOOT_SLUG_TO_NAME[form.service] ?? ""
      packageId = await resolvePackageId(serviceId, pkgName)
      if (packageId) {
        packageVariationId = await resolvePackageVariationId(packageId, form.photoshootSets ?? 1)
      }
    }
  } else if (isMakeupOnly) {
    // Makeup-only: look up the makeup service row (service_id = 3 in your DB)
    serviceId = await resolveServiceId("Makeup")
    if (!serviceId) serviceId = await resolveServiceId("Hair")
    if (serviceId) {
      makeupServiceId = await resolveMakeupServiceId(serviceId)
    }
  }

  // ── Resolve / create user ───────────────────────────────────────────────────
  let userId: string | null = null

  if (form.email.trim()) {
    const { data: existingUser } = await supabase
      .from("users").select("id").ilike("email", form.email.trim()).limit(1).maybeSingle()

    if (existingUser?.id) {
      userId = existingUser.id
      await supabase.from("users").update({
        first_name: form.firstName.trim() || null,
        last_name:  form.lastName.trim()  || null,
        phone:      form.phone.trim()     || null,
      }).eq("id", userId)
    } else {
      const newUserId = crypto.randomUUID()
      const { error } = await supabase.from("users").insert({
        id:         newUserId,
        email:      form.email.trim().toLowerCase(),
        first_name: form.firstName.trim() || null,
        last_name:  form.lastName.trim()  || null,
        phone:      form.phone.trim()     || null,
        role:       "client",
      })
      if (!error) userId = newUserId
      else console.error("[upsertBooking] createUser:", error.message)
    }
  }

  // ── Build makeup_service_id (studio rental addon OR standalone makeup_only) ──
  const bookingMakeupServiceId =
    (isStudioRental && form.addons.makeup) || isMakeupOnly
      ? makeupServiceId
      : null

  const numberOfPersons =
    (isStudioRental && form.addons.makeup) ? (form.makeupPeople ?? 1)
    : isMakeupOnly                          ? (form.makeupOnlyPeople ?? 1)
    : undefined

  // ── Conflict check — prevent double-booking ────────────────────────────────
  // Query for any pending/approved booking that overlaps [startDt, endDt),
  // excluding the booking currently being edited.
  {
    const startIso = toLocalDtString(startDt)
    const endIso   = toLocalDtString(endDt)

    let conflictQuery = supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "approved"])
      .lt("start_datetime", endIso)   // existing.start < newEnd
      .gt("end_datetime",   startIso) // existing.end   > newStart

    if (editingId) {
      conflictQuery = conflictQuery.neq("id", editingId)
    }

    const { count, error: conflictError } = await conflictQuery

    if (conflictError) {
      console.error("upsertBooking [conflict check]:", conflictError.message)
      alert("Could not verify availability. Please try again.")
      return null
    }

    if ((count ?? 0) > 0) {
      alert(
        "This time slot is already booked (pending or approved).\n" +
        "Please choose a different date or time."
      )
      return null
    }
  }

  if (editingId) {
    // ── UPDATE ──────────────────────────────────────────────────────────────
    const payload: Record<string, any> = {
      total_price:            calculatedPrice,
      start_datetime:         toLocalDtString(startDt),
      end_datetime:           toLocalDtString(endDt),
      notes:                  notesValue,
      package_name_snapshot:  form.service,
      package_price_snapshot: calculatedPrice,
      // Relational columns
      service_id:             serviceId             ?? undefined,
      package_id:             packageId             ?? undefined,
      package_variation_id:   packageVariationId    ?? undefined,
      studio_rental_option_id:studioRentalOptionId  ?? undefined,
      makeup_service_id:      bookingMakeupServiceId ?? undefined,
      number_of_persons:      numberOfPersons,
    }
    if (userId) payload.user_id = userId

    const { error } = await supabase.from("bookings").update(payload).eq("id", editingId)
    if (error) { console.error("updateBooking:", error.message); return null }

    // Sync booking_addons: clear old, re-insert
    await supabase.from("booking_addons").delete().eq("booking_id", editingId)
    await syncBookingAddons(editingId, form)

    // Upsert payment
    const { data: existingPmt } = await supabase
      .from("payments").select("id").eq("booking_id", editingId)
      .order("created_at", { ascending: false }).limit(1)

    if (existingPmt?.[0]) {
      await supabase.from("payments").update({
        payment_method: finalMethod || null,
        payment_reference: form.paymentReference || null,
        amount: calculatedPrice,
      }).eq("id", existingPmt[0].id)
    } else if (finalMethod || form.paymentReference) {
      await supabase.from("payments").insert({
        booking_id: editingId, amount: calculatedPrice,
        payment_method: finalMethod || null,
        payment_reference: form.paymentReference || null,
        status: "paid",
      })
    }

    return editingId

  } else {
    // ── INSERT ──────────────────────────────────────────────────────────────
    const { data: inserted, error } = await supabase
      .from("bookings")
      .insert({
        user_id:                userId,
        total_price:            calculatedPrice,
        start_datetime:         toLocalDtString(startDt),
        end_datetime:           toLocalDtString(endDt),
        notes:                  notesValue,
        package_name_snapshot:  form.service,
        package_price_snapshot: calculatedPrice,
        status:                 "pending",
        payment_status:         "pending",
        // Relational columns
        service_id:             serviceId             ?? undefined,
        package_id:             packageId             ?? undefined,
        package_variation_id:   packageVariationId    ?? undefined,
        studio_rental_option_id:studioRentalOptionId  ?? undefined,
        makeup_service_id:      bookingMakeupServiceId ?? undefined,
        number_of_persons:      numberOfPersons,
      })
      .select("id")
      .single()

    if (error || !inserted) { console.error("insertBooking:", error?.message); return null }

    // Write booking_addons
    await syncBookingAddons(inserted.id, form)

    if (finalMethod || form.paymentReference) {
      const { error: pmtError } = await supabase.from("payments").insert({
        booking_id: inserted.id, amount: calculatedPrice,
        payment_method: finalMethod || null,
        payment_reference: form.paymentReference || null,
        status: "paid",
      })
      if (pmtError) console.error("insertPayment:", pmtError.message)
    }

    return inserted.id
  }
}

// ─── Write booking_addons rows ─────────────────────────────────────────────────
// Only applies to Studio Rental bookings with add-ons selected.

async function syncBookingAddons(
  bookingId: number,
  form: {
    service: string
    addons: { photographer: boolean; makeup: boolean }
    makeupPeople: number
    studioHours: number
  }
): Promise<void> {
  if (form.service !== "studio_rental") return
  const { photographer, makeup } = form.addons
  if (!photographer && !makeup) return

  const rows: Array<{
    booking_id: number
    addon_id: number | null
    addon_price_snapshot: number
  }> = []

  if (photographer) {
    const addonId = await resolvePhotographerAddonId()
    rows.push({
      booking_id: bookingId,
      addon_id: addonId,
      addon_price_snapshot: 1500, // ADDON_PHOTOGRAPHER_PRICE
    })
  }

  if (makeup) {
    const addonId = await resolveMakeupAddonId()
    const perPerson = 1200 // ADDON_MAKEUP_PRICE_PER_PERSON
    rows.push({
      booking_id: bookingId,
      addon_id: addonId,
      addon_price_snapshot: perPerson * (form.makeupPeople ?? 1),
    })
  }

  if (rows.length > 0) {
    const { error } = await supabase.from("booking_addons").insert(rows)
    if (error) console.error("syncBookingAddons:", error.message)
  }
}

// ─── useAppointments hook ─────────────────────────────────────────────────────

function useAppointments(initialData: Appointment[]) {
  const [search, setSearch]             = useState("")
  const [sortBy, setSortBy]             = useState("none")
  const [statusFilter, setStatusFilter] = useState("all")

  let processedData = initialData
    .filter((item) => {
      const query = search.toLowerCase()
      return (
        item.name.toLowerCase().includes(query) ||
        (item.email ?? "").toLowerCase().includes(query)
      )
    })
    .filter((item) => statusFilter === "all" || item.status.toLowerCase() === statusFilter)

  if (sortBy !== "none") {
    processedData = [...processedData].sort((a, b) => {
      if (sortBy === "newest")      return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortBy === "oldest")      return new Date(a.date).getTime() - new Date(b.date).getTime()
      if (sortBy === "amount_high") return b.total_price - a.total_price
      if (sortBy === "amount_low")  return a.total_price - b.total_price
      if (sortBy === "name_az")     return a.name.localeCompare(b.name)
      if (sortBy === "name_za")     return b.name.localeCompare(a.name)
      return 0
    })
  }

  return { search, setSearch, sortBy, setSortBy, statusFilter, setStatusFilter, data: processedData }
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  currentPage, totalPages, onPageChange,
}: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-600">
      <span>Page {currentPage} of {totalPages}</span>
      <div className="flex gap-1">
        <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-50 transition-colors">Prev</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button key={page} onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded border transition-colors ${
              page === currentPage ? "bg-[#C8A96A] text-white border-[#C8A96A] font-semibold" : "hover:bg-gray-50"
            }`}>{page}</button>
        ))}
        <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
      </div>
    </div>
  )
}

// ─── AppointmentTable ─────────────────────────────────────────────────────────

function AppointmentTable({
  data, onEdit, onDelete, onStatusChange, isAdmin,
}: {
  data: Appointment[]; onEdit: (app: Appointment) => void
  onDelete: (id: number) => void; onStatusChange: (id: number, status: Status) => void
  isAdmin: boolean
}) {
  const [selected, setSelected]       = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // ── Delete modal state ─────────────────────────────────────────────────────
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    ids: number[]
    loading: boolean
  }>({ open: false, ids: [], loading: false })

  const openDeleteModal = (ids: number[]) =>
    setDeleteModal({ open: true, ids, loading: false })

  const handleConfirmDelete = async () => {
    setDeleteModal((prev) => ({ ...prev, loading: true }))
    for (const id of deleteModal.ids) onDelete(id)
    setSelected((prev) => prev.filter((id) => !deleteModal.ids.includes(id)))
    setDeleteModal({ open: false, ids: [], loading: false })
  }

  const handleCancelDelete = () =>
    setDeleteModal({ open: false, ids: [], loading: false })

  const totalPages    = Math.ceil(data.length / itemsPerPage)
  const start         = (currentPage - 1) * itemsPerPage
  const paginatedData = data.slice(start, start + itemsPerPage)

  const toggleSelect = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  const allSelected =
    paginatedData.length > 0 && paginatedData.every((item) => selected.includes(item.id))
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !paginatedData.map((i) => i.id).includes(id)))
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...paginatedData.map((i) => i.id)])))
    }
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      {isAdmin && selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border-b text-sm">
          <span className="text-red-600 font-medium">{selected.length} selected</span>
          <button
            onClick={() => openDeleteModal([...selected])}
            className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          ><Trash2 size={14} /> Delete Selected</button>
          <button onClick={() => setSelected([])} className="text-gray-500 hover:text-gray-700 underline">Clear</button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="rounded" />
              </th>
              <th className="p-3 text-left font-semibold text-gray-600">ID</th>
              <th className="p-3 text-left font-semibold text-gray-600">Client</th>
              <th className="p-3 text-left font-semibold text-gray-600">Date</th>
              <th className="p-3 text-left font-semibold text-gray-600">Time</th>
              <th className="p-3 text-left font-semibold text-gray-600">Service</th>
              <th className="p-3 text-left font-semibold text-gray-600">Price</th>
              <th className="p-3 text-left font-semibold text-gray-600">Payment Reference</th>
              <th className="p-3 text-left font-semibold text-gray-600">Payment Method</th>
              <th className="p-3 text-left font-semibold text-gray-600">Status</th>
              <th className="p-3 text-left font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr><td colSpan={11} className="p-10 text-center text-gray-400">No appointments found.</td></tr>
            ) : (
              paginatedData.map((app) => (
                <tr key={app.id} className={`border-t transition-colors ${selected.includes(app.id) ? "bg-amber-50" : "hover:bg-gray-50"}`}>
                  <td className="p-3">
                    <input type="checkbox" checked={selected.includes(app.id)} onChange={() => toggleSelect(app.id)} className="rounded" />
                  </td>
                  <td className="p-3 text-gray-600">#{app.id}</td>
                  <td className="p-3 font-medium">{app.name}</td>
                  <td className="p-3 text-gray-600">
                    {app.date
                      ? new Date(`${app.date}T00:00:00`).toLocaleDateString("en-PH", {
                          weekday: "short", month: "short", day: "numeric", year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="p-3 text-gray-600">
                    {app.time
                      ? (() => {
                          const fmt = (hhmm: string) => {
                            const [h, m] = hhmm.split(":").map(Number)
                            return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`
                          }
                          return `${fmt(app.time)} – ${fmt(getEndTime(app.time, app.duration))}`
                        })()
                      : "—"}
                  </td>
                  <td className="p-3 text-gray-700">{app.service}</td>
                  <td className="p-3 font-semibold text-[#C8A96A]">₱{app.totalPrice.toLocaleString()}</td>
                  <td className="p-3 text-gray-600">{app.paymentReference || "-"}</td>
                  <td className="p-3 text-gray-600 capitalize">{app.paymentMethod?.replace(/_/g, " ") || "-"}</td>
                  <td className="p-3">
                    {isAdmin ? (
                      <select value={app.status} onChange={(e) => onStatusChange(app.id, e.target.value as Status)}
                        className={`text-xs font-semibold px-3 py-1 rounded-full border-0 outline-none cursor-pointer appearance-none ${statusStyles[app.status]}`}>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyles[app.status]}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {isAdmin ? (
                      <div className="flex gap-3">
                        <button onClick={() => onEdit(app)} className="text-[#C8A96A] hover:text-[#b8935a] transition-colors" title="Edit"><Pencil size={16} /></button>
                        <button onClick={() => openDeleteModal([app.id])} className="text-red-400 hover:text-red-600 transition-colors" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <DeleteConfirmModal
        open={deleteModal.open}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleteModal.loading}
        count={deleteModal.ids.length > 1 ? deleteModal.ids.length : undefined}
      />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [open, setOpen]                 = useState(false)
  const [editingId, setEditingId]       = useState<number | null>(null)
  const [isAdmin, setIsAdmin]           = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
      if (profile?.role === "admin") setIsAdmin(true)
    }
    checkAdmin()
  }, [])

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    date: "", time: "", duration: 60, service: "",
    addons: { photographer: false, makeup: false },
    notes: "", paymentMethod: "", paymentReference: "", paymentMethodOther: "",
    studioHours: 1, studioBackdrop: false, photoshootSets: 1, makeupPeople: 1, makeupOnlyPeople: 1,
  })

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    setAppointments(await fetchBookings())
    setLoading(false)
  }, [])

  useEffect(() => {
    let channel: any

    const setupRealtime = async () => {
      await loadAppointments()

      try {
        channel = supabase
          .channel(`public:bookings:admin:${Date.now()}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "bookings",
            },
            async () => {
              await loadAppointments()
            }
          )
          .subscribe()
      } catch (err) {
        console.warn("Realtime subscription error", err)
      }
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [loadAppointments])

  const { search, setSearch, sortBy, setSortBy, statusFilter, setStatusFilter, data } =
    useAppointments(appointments)

  const openAdd = () => {
    setEditingId(null)
    setForm({
      firstName: "", lastName: "", email: "", phone: "",
      date: "", time: "", duration: 60, service: "",
      addons: { photographer: false, makeup: false },
      notes: "", paymentMethod: "", paymentReference: "", paymentMethodOther: "",
      studioHours: 1, studioBackdrop: false, photoshootSets: 1, makeupPeople: 1, makeupOnlyPeople: 1,
    })
    setOpen(true)
  }

  const openEdit = (app: Appointment) => {
    setEditingId(app.id)
    const isOther      = app.paymentMethod ? !STANDARD_METHODS.includes(app.paymentMethod) : false
    const isPhotoshoot = ["pkg_a", "pkg_b", "pkg_c"].includes(app.serviceSlug)
    setForm({
      firstName:          app.firstName,
      lastName:           app.lastName,
      email:              app.email,
      phone:              app.phone,
      date:               app.date,
      time:               app.time,
      duration:           isPhotoshoot ? app.photoshootSets * 120 : app.duration,
      service:            app.serviceSlug,
      addons:             app.addons,
      notes:              app.notes,
      paymentMethod:      isOther ? "other" : (app.paymentMethod || ""),
      paymentReference:   app.paymentReference || "",
      paymentMethodOther: isOther ? (app.paymentMethod || "") : "",
      studioHours:        app.studioHours,
      studioBackdrop:     app.studioBackdrop,
      photoshootSets:     app.photoshootSets,
      makeupPeople:       app.makeupPeople,
      makeupOnlyPeople:   app.makeupOnlyPeople,
    })
    setOpen(true)
  }

  const handleSave = async (calculatedPrice: number) => {
    setSaving(true)
    const existingStatus = appointments.find((a) => a.id === editingId)?.status ?? "pending"
    const newId = await upsertBooking(form, calculatedPrice, editingId, existingStatus)
    setSaving(false)
    if (newId !== null) {
      await loadAppointments()
      setOpen(false)
    }
    // If newId is null (conflict or error), keep dialog open so user can fix it
  }

  const handleDelete = async (id: number) => {
    const previous = appointments
    setAppointments((prev) => prev.filter((a) => a.id !== id))
    const ok = await deleteBookingFromDb(id)
    if (!ok) {
      setAppointments(previous)
      alert("Failed to delete booking in database. Nothing was removed.")
      return
    }
    await loadAppointments()
  }

  const handleStatusChange = async (id: number, status: Status) => {
    // Optimistic UI update
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))

    // Update status in DB
    await updateStatusInDb(id, status)

    // Sync with Google Calendar
    if (status === "approved") {
      fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, action: "create" }),
      }).catch((err) => console.error("calendar sync (create):", err))
    } else if (status === "cancelled") {
      fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, action: "delete" }),
      }).catch((err) => console.error("calendar sync (delete):", err))
    }
  }

  const counts = {
    all:       appointments.length,
    approved:  appointments.filter((a) => a.status === "approved").length,
    pending:   appointments.filter((a) => a.status === "pending").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-[#8f7a53]">Management</p>
          <h1 className="font-serif text-3xl font-semibold text-[#111111] md:text-4xl">Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">{counts.all} total appointments</p>
        </div>
        {isAdmin && (
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-[#C8A96A] hover:bg-[#b8935a] transition-colors px-4 py-2 rounded-lg text-white font-medium shadow-sm">
            <Plus size={16} /> Add Appointment
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {(["all", "approved", "pending", "cancelled"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
              statusFilter === s
                ? s === "all"      ? "bg-gray-800 text-white border-gray-800"
                : s === "approved" ? "bg-green-600 text-white border-green-600"
                : s === "pending"  ? "bg-yellow-500 text-white border-yellow-500"
                                   : "bg-red-500 text-white border-red-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}{" "}
            <span className="ml-1 opacity-70">({counts[s as keyof typeof counts] ?? data.length})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/40 focus:border-[#C8A96A] transition" />
        </div>
        <div className="relative">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A96A]/40 focus:border-[#C8A96A] transition bg-white">
            <option value="none">Sort: Default</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount_high">Price: High → Low</option>
            <option value="amount_low">Price: Low → High</option>
            <option value="name_az">Name: A → Z</option>
            <option value="name_za">Name: Z → A</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {(search || statusFilter !== "all") && (
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-700">{data.length}</span> result
          {data.length !== 1 ? "s" : ""}
          {search && <> for <span className="font-semibold text-gray-700">"{search}"</span></>}
        </p>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400 text-sm animate-pulse">
          Loading appointments…
        </div>
      ) : (
        <AppointmentTable
          data={data} onEdit={openEdit} onDelete={handleDelete}
          onStatusChange={handleStatusChange} isAdmin={isAdmin}
        />
      )}

      <EditAppointmentDialog
        open={open} onClose={() => setOpen(false)}
        form={form} setForm={setForm} onSave={handleSave} saving={saving}
        bookingId={editingId}
      />

      {saving && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl px-8 py-5 flex items-center gap-3 shadow-xl text-sm font-medium text-gray-700">
            <svg className="animate-spin h-5 w-5 text-[#C8A96A]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Saving appointment…
          </div>
        </div>
      )}
    </div>
  )
}
