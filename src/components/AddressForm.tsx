import { useState } from "react";
import type { Address } from "../data/mock";
import { useApp } from "../state";
import { Button, Modal } from "./ui";
import { MapPicker } from "./MapPicker";

/** Add / edit an address in a modal; saves into app state. */
export default function AddressForm({ open, onClose, address, onSaved }: { open: boolean; onClose: () => void; address?: Address; onSaved?: (address: Address) => void }) {
  const { saveAddress, addresses, user } = useApp();
  const [form, setForm] = useState<Address>(
    () => address ?? { id: Math.max(0, ...addresses.map((item) => item.id)) + 1, label: "", icon: "home", detail: "", receiver: user?.name ?? "", phone: user?.phone ?? "", postalCode: "" },
  );
  const set = <K extends keyof Address>(key: K, value: Address[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const valid = form.label.trim() && form.detail.trim().length > 8 && form.receiver.trim() && form.phone.trim();

  return (
    <Modal open={open} onClose={onClose} title={address ? "ویرایش آدرس" : "افزودن آدرس جدید"} subtitle="موقعیت را روی نقشه مشخص و جزئیات را کامل کنید.">
      <MapPicker className="mt-5 h-40" />
      <div className="mt-4 flex gap-2">
        {(["منزل", "محل کار", "کارگاه"] as const).map((label) => (
          <Button key={label} className={`filter-chip ${form.label === label ? "filter-chip-active" : ""}`} onClick={() => { set("label", label); set("icon", label === "منزل" ? "home" : "box"); }}>{label}</Button>
        ))}
      </div>
      <label className="form-label">عنوان آدرس<input className="form-field" value={form.label} onChange={(event) => set("label", event.target.value)} placeholder="مثال: منزل" /></label>
      <label className="form-label">نشانی کامل<textarea className="form-field min-h-20 resize-none" value={form.detail} onChange={(event) => set("detail", event.target.value)} placeholder="شهر، محله، خیابان، کوچه، پلاک، واحد" /></label>
      <div className="grid gap-x-3 sm:grid-cols-2">
        <label className="form-label">نام تحویل‌گیرنده<input className="form-field" value={form.receiver} onChange={(event) => set("receiver", event.target.value)} /></label>
        <label className="form-label">شماره تماس<input className="form-field" inputMode="tel" value={form.phone} onChange={(event) => set("phone", event.target.value)} /></label>
      </div>
      <label className="form-label">کد پستی<input className="form-field" inputMode="numeric" value={form.postalCode} onChange={(event) => set("postalCode", event.target.value)} placeholder="۱۰ رقم" /></label>
      <Button className="primary-button mt-6 w-full justify-center" disabled={!valid} onClick={() => { saveAddress(form); onSaved?.(form); onClose(); }}>ذخیره آدرس</Button>
    </Modal>
  );
}
