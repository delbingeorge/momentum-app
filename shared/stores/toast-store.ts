import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info";

interface ToastData {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toast: ToastData | null;
  show: (message: string, variant?: ToastVariant, durationMs?: number) => void;
  dismiss: () => void;
}

let nextId = 1;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>()((set) => ({
  toast: null,
  show: (message, variant = "info", durationMs = 3000) => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ toast: { id: nextId++, message, variant } });
    hideTimer = setTimeout(() => {
      hideTimer = null;
      set({ toast: null });
    }, durationMs);
  },
  dismiss: () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    set({ toast: null });
  },
}));

export const toast = {
  success: (message: string, durationMs?: number) =>
    useToastStore.getState().show(message, "success", durationMs),
  error: (message: string, durationMs?: number) =>
    useToastStore.getState().show(message, "error", durationMs),
  info: (message: string, durationMs?: number) =>
    useToastStore.getState().show(message, "info", durationMs),
};
