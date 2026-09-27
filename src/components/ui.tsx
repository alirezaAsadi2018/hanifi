import { useEffect, useRef, type ReactNode } from "react";
import Icon from "./Icon";

export function Button({ children, className = "", onClick, label, disabled = false, type = "button" }: {
  children: ReactNode; className?: string; onClick?: () => void; label?: string; disabled?: boolean; type?: "button" | "submit";
}) {
  return <button type={type} disabled={disabled} aria-label={label} className={`cursor-pointer select-none transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} onClick={onClick}>{children}</button>;
}

export function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title: string }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>("button,[href],[tabindex]:not([tabindex='-1'])") ?? []);
    focusable()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const items = focusable();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label={title} className="request-modal">
        <div className="flex items-start justify-between gap-4">
          <div><div className="text-xl font-black">{title}</div><div className="mt-2 text-sm text-muted">اطلاعات را تکمیل کنید تا بهترین گزینه را پیدا کنیم.</div></div>
          <Button className="icon-action" onClick={onClose} label="بستن"><Icon name="close" /></Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const formatNumber = (value: number) => value.toLocaleString("fa-IR");
export const formatPrice = (value: number) => `${formatNumber(value)} تومان`;
