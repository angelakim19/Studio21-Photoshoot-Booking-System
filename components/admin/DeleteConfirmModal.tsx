"use client"

import { useEffect, useRef } from "react"
import { Trash2, AlertTriangle, X } from "lucide-react"

interface DeleteConfirmModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  title?: string
  description?: string
  /** When provided, renders a bulk-delete message like "Delete 5 items?" */
  count?: number
}

export default function DeleteConfirmModal({
  open,
  onConfirm,
  onCancel,
  loading = false,
  title,
  description,
  count,
}: DeleteConfirmModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Auto-focus Cancel on open for accessibility
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => cancelRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [open])

  // Close on ESC
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, loading, onCancel])

  if (!open) return null

  const isBulk = typeof count === "number" && count > 1

  const resolvedTitle =
    title ?? (isBulk ? `Delete ${count} items?` : "Confirm Deletion")

  const resolvedDescription =
    description ??
    (isBulk
      ? `You are about to permanently delete ${count} selected appointments. This action cannot be undone.`
      : "Are you sure you want to delete this item? This action cannot be undone.")

  return (
    // Overlay
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-desc"
    >
      {/* Semi-transparent backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !loading && onCancel()}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className={`
          relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl
          animate-in fade-in zoom-in-95 duration-200
          ring-1 ring-black/5
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close × button */}
        <button
          onClick={() => !loading && onCancel()}
          disabled={loading}
          aria-label="Close"
          className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
        >
          <X size={16} />
        </button>

        <div className="p-6">
          {/* Icon badge */}
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mx-auto mb-4">
            {isBulk ? (
              <AlertTriangle className="text-red-500" size={26} strokeWidth={1.8} />
            ) : (
              <Trash2 className="text-red-500" size={24} strokeWidth={1.8} />
            )}
          </div>

          {/* Title */}
          <h2
            id="delete-modal-title"
            className="text-center text-lg font-bold text-gray-900 mb-2"
          >
            {resolvedTitle}
          </h2>

          {/* Description */}
          <p
            id="delete-modal-desc"
            className="text-center text-sm text-gray-500 leading-relaxed"
          >
            {resolvedDescription}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Actions */}
        <div className="flex gap-3 p-4">
          <button
            ref={cancelRef}
            onClick={() => !loading && onCancel()}
            disabled={loading}
            className="
              flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
              bg-gray-100 text-gray-700 border border-gray-200
              hover:bg-gray-200 hover:border-gray-300
              focus:outline-none focus:ring-2 focus:ring-gray-300
              transition-all disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="
              flex-1 flex items-center justify-center gap-2
              px-4 py-2.5 rounded-xl text-sm font-semibold
              bg-red-500 text-white
              hover:bg-red-600 active:scale-[0.98]
              focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1
              transition-all disabled:opacity-70 disabled:cursor-not-allowed
              shadow-sm shadow-red-200
            "
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={14} />
                {isBulk ? `Delete ${count} Items` : "Delete"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
