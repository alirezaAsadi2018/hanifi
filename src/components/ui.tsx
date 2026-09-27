import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Icon, { type IconName } from "./Icon";

export function Button({ children, className = "", onClick, label, disabled = false, type = "button", style }: {
  children: ReactNode; className?: string; onClick?: () => void; label?: string; disabled?: boolean; type?: "button" | "submit"; style?: CSSProperties;
}) {
  return <button type={type} disabled={disabled} aria-label={label} style={style} className={`cursor-pointer select-none transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} onClick={onClick}>{children}</button>;
}

export function Modal({ open, onClose, children, title, subtitle = "اطلاعات را تکمیل کنید تا بهترین گزینه را پیدا کنیم.", wide = false }: {
  open: boolean; onClose: () => void; children: ReactNode; title: string; subtitle?: string; wide?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>("button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex='-1'])") ?? []);
    focusable()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
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
  }, [open]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label={title} className={`request-modal max-h-[92vh] overflow-y-auto ${wide ? "max-w-3xl" : ""}`}>
        <div className="flex items-start justify-between gap-4">
          <div><div className="text-xl font-black">{title}</div>{subtitle && <div className="mt-2 text-sm text-muted">{subtitle}</div>}</div>
          <Button className="icon-action" onClick={onClose} label="بستن"><Icon name="close" /></Button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Confirmation dialog; when `reasons` is given the user must pick (or type) a reason first. */
export function ConfirmDialog({ open, title, text, confirmLabel, danger = false, reasons, onConfirm, onClose }: {
  open: boolean; title: string; text?: string; confirmLabel: string; danger?: boolean; reasons?: string[]; onConfirm: (reason: string) => void; onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [custom, setCustom] = useState("");
  useEffect(() => { if (open) { setReason(""); setCustom(""); } }, [open]);
  const finalReason = reason === "سایر" ? custom.trim() : reason;
  const blocked = Boolean(reasons) && !finalReason;
  return (
    <Modal open={open} onClose={onClose} title={title} subtitle={text ?? ""}>
      {reasons && (
        <div className="mt-5 space-y-2">
          {[...reasons, "سایر"].map((item) => (
            <Button key={item} className={`radio-row ${reason === item ? (danger ? "radio-row-danger" : "radio-row-active") : ""}`} onClick={() => setReason(item)}>
              <span className="radio-dot">{reason === item && <span />}</span>{item}
            </Button>
          ))}
          {reason === "سایر" && <textarea className="form-field min-h-20 resize-none" placeholder="دلیل را بنویسید..." value={custom} onChange={(event) => setCustom(event.target.value)} />}
        </div>
      )}
      <div className="mt-6 flex gap-2">
        <Button className={`${danger ? "danger-button" : "primary-button"} flex-1 justify-center`} disabled={blocked} onClick={() => { onConfirm(finalReason); onClose(); }}>{confirmLabel}</Button>
        <Button className="secondary-button justify-center px-6" onClick={onClose}>انصراف</Button>
      </div>
    </Modal>
  );
}

export function PageHeader({ title, subtitle, back, action }: { title: string; subtitle?: string; back?: () => void; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      {back && <Button className="icon-action" onClick={back} label="بازگشت"><Icon name="back" /></Button>}
      <div className="min-w-0"><div className="text-xl font-black sm:text-2xl">{title}</div>{subtitle && <div className="mt-1 text-xs text-muted sm:text-sm">{subtitle}</div>}</div>
      {action && <div className="mr-auto shrink-0">{action}</div>}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { key: T; label: string; count?: number }[]; value: T; onChange: (key: T) => void }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <Button key={tab.key} className={`tab ${value === tab.key ? "tab-active" : ""}`} onClick={() => onChange(tab.key)}>
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && <span className="tab-count">{formatNumber(tab.count)}</span>}
        </Button>
      ))}
    </div>
  );
}

export function EmptyState({ icon, text, hint, action, onClick }: { icon: IconName; text: string; hint?: string; action?: string; onClick?: () => void }) {
  return (
    <div className="surface-card py-12 text-center">
      <span className="success-mark"><Icon name={icon} /></span>
      <div className="mt-4 font-black">{text}</div>
      {hint && <div className="mx-auto mt-2 max-w-sm text-sm text-muted">{hint}</div>}
      {action && <Button className="primary-button mx-auto mt-5" onClick={onClick}>{action}</Button>}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`toggle ${checked ? "toggle-on" : ""}`}>
      <span />
    </button>
  );
}

export type UploadState = "empty" | "uploading" | "uploaded" | "rejected";

/** Document upload tile with the four states the KYC flow needs. */
export function UploadTile({ label, hint, state, preview, rejectReason, onPick, onRemove }: {
  label: string; hint?: string; state: UploadState; preview?: string; rejectReason?: string; onPick: (file: File) => void; onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={`upload-tile ${state === "rejected" ? "border-red-300 bg-red-50/50" : state === "uploaded" ? "border-brand/30" : ""}`}>
      <div className="flex items-center gap-3">
        <span className={`flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl ${state === "uploaded" ? "bg-green-50 text-green-700" : state === "rejected" ? "bg-red-100 text-red-600" : "bg-canvas text-muted"}`}>
          {preview && state !== "empty" ? <img src={preview} alt="" className="size-full object-cover" /> : <Icon name={state === "rejected" ? "close" : "plus"} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-black">{label}</div>
          <div className={`mt-1 text-xs ${state === "rejected" ? "font-bold text-red-600" : state === "uploaded" ? "font-bold text-success" : "text-muted"}`}>
            {state === "empty" && (hint ?? "JPG یا PNG، حداکثر ۵ مگابایت")}
            {state === "uploading" && "در حال بارگذاری..."}
            {state === "uploaded" && "بارگذاری شد"}
            {state === "rejected" && `رد شده: ${rejectReason ?? "تصویر خوانا نیست"}`}
          </div>
          {state === "uploading" && <div className="mt-2 h-1 overflow-hidden rounded-full bg-line"><div className="upload-progress h-full rounded-full bg-brand" /></div>}
        </div>
        {state === "uploaded" ? (
          <Button className="text-xs font-bold text-red-600" onClick={onRemove}>حذف</Button>
        ) : state !== "uploading" && (
          <Button className="rounded-xl bg-brand-soft px-3 py-2 text-xs font-black text-brand" onClick={() => inputRef.current?.click()}>{state === "rejected" ? "ارسال مجدد" : "انتخاب فایل"}</Button>
        )}
        <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) onPick(file); event.target.value = ""; }} />
      </div>
    </div>
  );
}

export function Stars({ value }: { value: number }) {
  return <span className="rating"><Icon name="star" size="sm" />{formatDecimal(value)}</span>;
}

export const formatNumber = (value: number) => value.toLocaleString("fa-IR");
/** Order / request / transaction numbers: Persian digits, no thousands separator. */
export const formatId = (value: number) => value.toLocaleString("fa-IR", { useGrouping: false });
export const formatDecimal = (value: number) => value.toLocaleString("fa-IR", { maximumFractionDigits: 1 });
export const formatPrice = (value: number) => `${formatNumber(value)} تومان`;
export const toPersianDigits = (value: string) => value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
export const toLatinDigits = (value: string) => value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
