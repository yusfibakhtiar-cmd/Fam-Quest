import { useEffect } from "react";
import { create } from "zustand";

type ToastState = { message: string | null; token: number; show: (m: string) => void; clear: () => void };

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  token: 0,
  show: (message) => set((s) => ({ message, token: s.token + 1 })),
  clear: () => set({ message: null }),
}));

export function Toast() {
  const { message, token, clear } = useToastStore();
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(clear, 2200);
    return () => clearTimeout(t);
  }, [message, token, clear]);
  return message ? <div className="toast" role="status">{message}</div> : null;
}
