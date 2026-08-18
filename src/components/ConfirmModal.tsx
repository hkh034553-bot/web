"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={busy ? undefined : onCancel}
            className="absolute inset-0 bg-black"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            className="relative w-full max-w-md brutalist-card bg-surface p-7"
          >
            <button
              onClick={onCancel}
              disabled={busy}
              aria-label="Close dialog"
              className="absolute top-4 right-4 w-8 h-8 border-2 border-border rounded-full flex items-center justify-center bg-bg text-text hover:bg-accent-coral hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4 mb-5">
              <span
                className={`w-11 h-11 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0 ${
                  tone === "danger" ? "bg-accent-coral" : "bg-accent-sky"
                } text-white`}
              >
                <AlertTriangle className="w-5 h-5" />
              </span>
              <h3 id="confirm-modal-title" className="font-display font-bold text-xl text-text">
                {title}
              </h3>
            </div>

            <div className="text-sm text-text-muted leading-relaxed mb-7">{message}</div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                disabled={busy}
                className="brutalist-btn brutalist-btn-secondary px-5 py-2.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={busy}
                className={`brutalist-btn px-5 py-2.5 text-xs text-white border-2 border-border shadow-brutal-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                  tone === "danger" ? "bg-accent-coral" : "bg-accent-sky"
                }`}
              >
                {busy ? "Working..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
