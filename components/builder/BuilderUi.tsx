"use client";

/**
 * Small UI services shared by the builder: a toast and a promise-based
 * confirm dialog. Kept out of the configurator store so the store stays a
 * pure model of the design.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { ConfirmDialog, type ConfirmOptions } from "./ConfirmDialog";
import { Toast } from "./Toast";

interface BuilderUiValue {
  showToast: (message: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const BuilderUiContext = createContext<BuilderUiValue | null>(null);

export function BuilderUiProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const [dialog, setDialog] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message });
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    resolver.current?.(false); // a second prompt supersedes a pending one
    setDialog(options);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setDialog(null);
  };

  const value = useMemo(() => ({ showToast, confirm }), [showToast, confirm]);

  return (
    <BuilderUiContext.Provider value={value}>
      {children}
      <ConfirmDialog options={dialog} onConfirm={() => settle(true)} onCancel={() => settle(false)} />
      <Toast message={toast?.message ?? null} toastKey={toast?.id ?? 0} />
    </BuilderUiContext.Provider>
  );
}

export function useBuilderUi(): BuilderUiValue {
  const ctx = useContext(BuilderUiContext);
  if (!ctx) throw new Error("useBuilderUi must be used inside <BuilderUiProvider>");
  return ctx;
}
