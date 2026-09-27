import { useRef, useState } from "react";
import { Button, formatNumber, formatPrice } from "../components/ui";
import Icon, { type IconName } from "../components/Icon";
import { categories, extendedTechnicians, myServiceRequests } from "../data/mock";
import type { Navigate } from "../types";

// ─────────────────────────────────────────────
// Shared local data
// ─────────────────────────────────────────────

const savedAddresses = [
  { id: 1, label: "منزل", icon: "home" as IconName, detail: "سعادت‌آباد، خیابان دانشجو، پلاک ۱۲" },
  { id: 2, label: "محل کار", icon: "box" as IconName, detail: "جاده مخصوص، شهرک صنعتی واحد ۴" },
];

const timeSlots = ["۸ تا ۱۱", "۱۱ تا ۱۴", "۱۴ تا ۱۷", "۱۷ تا ۲۰"];
const jalaliDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
const jalaliDayOffset = 4; // Azar 1403 approx starts Wednesday
const jalaliDayCount = 30;
const todayDay = 7;

// ─────────────────────────────────────────────
// Wizard state
// ─────────────────────────────────────────────

type MediaFile = { url: string; name: string; isVideo: boolean };

type WizardData = {
  serviceType: string;
  deviceType: string;
  brand: string;
  model: string;
  problem: string;
  mediaFiles: MediaFile[];
  savedAddressId: number | null;
  addressDetails: string;
  timeChoice: "asap" | "scheduled";
  selectedDate: string;
  timeSlot: string;
  technicianId: number | null;
};

// ─────────────────────────────────────────────
// Step wrapper card
// ─────────────────────────────────────────────

function StepCard({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-line bg-white p-5 sm:p-7">
      <div className="text-xl font-black">{title}</div>
      <div className="mt-1.5 text-sm text-muted">{desc}</div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// Mock map background
// ─────────────────────────────────────────────

function MapBg({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-sky-50 ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(8,127,104,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(8,127,104,.06) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-0 right-0 top-1/3 h-8 bg-white" />
        <div className="absolute bottom-0 top-0 right-1/3 w-5 bg-white" />
        <div className="absolute left-1/4 right-0 top-2/3 h-4 bg-white" />
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// Step 6: Technician picker
// ─────────────────────────────────────────────

function TechnicianPicker({
  data,
  update,
  onNext,
}: {
  data: WizardData;
  update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void;
  onNext: () => void;
}) {
  const [view, setView] = useState<"list" | "map">("list");

  return (
    <StepCard title="انتخاب نصاب" desc="از بین نصاب‌های نزدیک یکی انتخاب کنید یا به همه ارسال کنید">
      {/* View toggle */}
      <div className="mt-5 flex rounded-xl border border-line bg-canvas p-1">
        {(["list", "map"] as const).map((v) => (
          <Button
            key={v}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-all ${view === v ? "bg-white text-ink shadow-sm" : "text-muted"}`}
            onClick={() => setView(v)}
          >
            <Icon name={v === "list" ? "menu" : "pin"} size="sm" />
            {v === "list" ? "فهرست" : "نقشه"}
          </Button>
        ))}
      </div>

      {/* Map view: approximate circles only, no exact points */}
      {view === "map" && (
        <MapBg className="mt-4 h-64">
          {[
            { x: "42%", y: "38%", color: "rgba(25,155,102,.18)", size: 96, id: 1 },
            { x: "65%", y: "58%", color: "rgba(25,155,102,.13)", size: 80, id: 2 },
            { x: "26%", y: "65%", color: "rgba(140,140,140,.12)", size: 88, id: 3 },
          ].map((z) => (
            <div
              key={z.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: z.x, top: z.y,
                width: z.size, height: z.size,
                background: z.color,
                border: "1px solid rgba(8,127,104,.2)",
              }}
            />
          ))}
          {/* User pin */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
            <div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-brand text-white shadow-lg">
              <Icon name="pin" size="sm" />
            </div>
          </div>
          <div className="absolute bottom-3 right-3 rounded-xl bg-white/90 px-3 py-2 text-xs font-bold shadow backdrop-blur">
            محدوده تقریبی فعالیت نصاب‌ها
          </div>
        </MapBg>
      )}

      <div className="mt-4 space-y-3">
        {/* Send to all */}
        <Button
          className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-right transition-all ${data.technicianId === null ? "border-brand bg-brand-soft" : "border-line bg-white hover:border-brand/40"}`}
          onClick={() => update("technicianId", null)}
        >
          <span className="category-icon shrink-0 bg-ink text-white">
            <Icon name="users" />
          </span>
          <span className="flex-1">
            <span className="block font-extrabold">ارسال به همه نصاب‌های نزدیک</span>
            <span className="mt-0.5 block text-xs text-muted">سریع‌ترین پاسخ، اولین پذیرش</span>
          </span>
          {data.technicianId === null && (
            <span className="check-badge shrink-0">
              <Icon name="check" size="sm" />
            </span>
          )}
        </Button>

        {extendedTechnicians.map((tech, i) => {
          const disabled = tech.status !== "آنلاین";
          const selected = data.technicianId === tech.id;
          const statusEmoji = tech.status === "آنلاین" ? "🟢" : tech.status === "مشغول" ? "🔴" : "⚪";
          return (
            <Button
              key={tech.id}
              disabled={disabled}
              className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-right transition-all ${
                selected
                  ? "border-brand bg-brand-soft"
                  : disabled
                  ? "border-line bg-canvas opacity-60"
                  : "border-line bg-white hover:border-brand/40"
              }`}
              onClick={() => !disabled && update("technicianId", tech.id)}
            >
              <span className={`avatar avatar-${(i % 3) + 1} shrink-0`}>
                <Icon name="user" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold">{tech.name}</span>
                  <span className="text-xs">{statusEmoji} {tech.status}</span>
                </span>
                <span className="mt-1 block text-xs text-muted">{tech.skill}</span>
                <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
                  <span>⭐ {tech.rating.toLocaleString("fa-IR")}</span>
                  <span>{formatNumber(tech.jobs)} پروژه</span>
                  <span>{formatNumber(tech.acceptance)}٪ پذیرش</span>
                  <span>{tech.distance.toLocaleString("fa-IR")} کیلومتر</span>
                  <span className="font-bold text-ink">از {formatPrice(tech.tariffs[0].price)}</span>
                </span>
              </span>
              {selected && (
                <span className="check-badge shrink-0">
                  <Icon name="check" size="sm" />
                </span>
              )}
            </Button>
          );
        })}
      </div>

      <Button className="primary-button mt-6 w-full justify-center" onClick={onNext}>
        مرحله بعد
        <Icon name="arrow" size="sm" />
      </Button>
    </StepCard>
  );
}

// ─────────────────────────────────────────────
// Step 7: Review & submit
// ─────────────────────────────────────────────

function ReviewStep({ data, onSubmit }: { data: WizardData; onSubmit: () => void }) {
  const tech = extendedTechnicians.find((t) => t.id === data.technicianId);
  const addr = savedAddresses.find((a) => a.id === data.savedAddressId);

  const rows = [
    { label: "نوع خدمت", value: data.serviceType },
    { label: "دستگاه", value: [data.deviceType, data.brand, data.model].filter(Boolean).join(" — ") || "—" },
    { label: "شرح مشکل", value: data.problem || "—" },
    {
      label: "آدرس",
      value: addr ? `${addr.label}: ${addr.detail}` : data.addressDetails || "موقعیت فعلی",
    },
    {
      label: "زمان",
      value:
        data.timeChoice === "asap"
          ? "در سریع‌ترین زمان"
          : `${data.selectedDate} آذر ۱۴۰۳ — ${data.timeSlot}`,
    },
    { label: "نصاب", value: tech ? tech.name : "ارسال به همه نصاب‌های نزدیک" },
  ];

  return (
    <StepCard title="مرور و ثبت نهایی" desc="اطلاعات درخواست را بررسی و تأیید کنید">
      <div className="mt-5 space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex gap-3 rounded-2xl bg-canvas p-3">
            <span className="shrink-0 text-sm font-black text-brand">{r.label}:</span>
            <span className="text-sm text-muted">{r.value}</span>
          </div>
        ))}
        {data.mediaFiles.length > 0 && (
          <div className="rounded-2xl bg-canvas p-3 text-sm">
            <span className="font-black text-brand">فایل‌های پیوست:</span>{" "}
            <span className="text-muted">{formatNumber(data.mediaFiles.length)} فایل</span>
          </div>
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-brand/20 bg-brand-soft p-4 text-sm text-muted">
        با ثبت درخواست، درخواست شما برای نصاب‌های احراز هویت‌شده ارسال و در کمتر از ۵ دقیقه پاسخ دریافت خواهید کرد.
      </div>

      <Button className="primary-button mt-5 w-full justify-center" onClick={onSubmit}>
        <Icon name="check" />
        ثبت درخواست
      </Button>
    </StepCard>
  );
}

// ─────────────────────────────────────────────
// SERVICE WIZARD SCREEN (main export)
// ─────────────────────────────────────────────

export function ServiceWizardScreen({
  navigate,
  preselectedService = "",
}: {
  navigate: Navigate;
  preselectedService?: string;
}) {
  const TOTAL = 7;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    serviceType: preselectedService,
    deviceType: "",
    brand: "",
    model: "",
    problem: "",
    mediaFiles: [],
    savedAddressId: null,
    addressDetails: "",
    timeChoice: "asap",
    selectedDate: "",
    timeSlot: timeSlots[0],
    technicianId: null,
  });

  const update = <K extends keyof WizardData>(key: K, value: WizardData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const next = () => setStep((s) => Math.min(s + 1, TOTAL));
  const back = () => {
    if (step > 1) setStep((s) => s - 1);
    else navigate("home");
  };

  const handleMediaAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newFiles = files
      .slice(0, 5 - data.mediaFiles.length)
      .map((f) => ({ url: URL.createObjectURL(f), name: f.name, isVideo: f.type.startsWith("video") }));
    update("mediaFiles", [...data.mediaFiles, ...newFiles]);
    e.target.value = "";
  };

  const serviceTypes = ["نصب", "تعمیر", "عیب‌یابی", "سرویس دوره‌ای"];

  return (
    <div className="min-h-screen bg-canvas pb-24" dir="rtl">
      {/* Sticky header with step indicator */}
      <div className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Button className="icon-action shrink-0" onClick={back} label="بازگشت">
            <Icon name="arrow" />
          </Button>
          <div className="flex-1">
            <div className="text-sm font-black">ثبت درخواست خدمت</div>
            <div className="mt-0.5 text-xs text-muted">
              مرحله {step.toLocaleString("fa-IR")} از {TOTAL.toLocaleString("fa-IR")}
            </div>
          </div>
          <div className="shrink-0 text-xs font-bold text-brand">
            {Math.round((step / TOTAL) * 100)}٪
          </div>
        </div>
        <div className="mx-auto mt-3 flex max-w-2xl gap-1">
          {Array.from({ length: TOTAL }, (_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < step ? "bg-brand" : "bg-line"}`}
            />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Step 1: Service type */}
        {step === 1 && (
          <StepCard title="نوع خدمت را انتخاب کنید" desc="چه کمکی می‌توانیم انجام دهیم؟">
            <div className="mt-5 grid grid-cols-2 gap-3">
              {serviceTypes.map((s) => {
                const active = data.serviceType === s;
                return (
                  <Button
                    key={s}
                    className={`service-option flex-col gap-3 py-6 ${active ? "border-brand bg-brand-soft" : ""}`}
                    onClick={() => { update("serviceType", s); next(); }}
                  >
                    <span className={`category-icon ${active ? "bg-brand text-white" : ""}`}>
                      <Icon name="tool" />
                    </span>
                    <span className="font-extrabold">{s}</span>
                  </Button>
                );
              })}
            </div>
          </StepCard>
        )}

        {/* Step 2: Device type + brand/model */}
        {step === 2 && (
          <StepCard title="نوع دستگاه" desc="دستگاهی که نیاز به خدمت دارد را انتخاب کنید">
            <div className="mt-5 grid grid-cols-2 gap-3">
              {categories.map((c) => {
                const active = data.deviceType === c.title;
                return (
                  <Button
                    key={c.title}
                    className={`service-option flex-col gap-3 py-6 ${active ? "border-brand bg-brand-soft" : ""}`}
                    onClick={() => update("deviceType", c.title)}
                  >
                    <span className={`category-icon ${active ? "bg-brand text-white" : ""}`}>
                      <Icon name={c.icon as IconName} />
                    </span>
                    <span className="font-extrabold">{c.title}</span>
                  </Button>
                );
              })}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-bold">
                برند (اختیاری)
                <input
                  className="form-field mt-2"
                  placeholder="مثال: پنتاکس، موتوژن، سهند"
                  value={data.brand}
                  onChange={(e) => update("brand", e.target.value)}
                />
              </label>
              <label className="block text-sm font-bold">
                مدل (اختیاری)
                <input
                  className="form-field mt-2"
                  placeholder="مثال: CAM-100"
                  value={data.model}
                  onChange={(e) => update("model", e.target.value)}
                />
              </label>
            </div>
            <Button
              className="primary-button mt-6 w-full justify-center"
              disabled={!data.deviceType}
              onClick={next}
            >
              مرحله بعد
            </Button>
          </StepCard>
        )}

        {/* Step 3: Problem description + media */}
        {step === 3 && (
          <StepCard title="شرح مشکل" desc="هر چه جزئیات بیشتری بدهید نصاب بهتر آماده می‌شود">
            <label className="mt-5 block text-sm font-bold">
              توضیح مشکل
              <textarea
                className="form-field mt-2 min-h-36 resize-none"
                placeholder="مثال: پمپ روشن می‌شود ولی فشار کافی ندارد، صدای غیرعادی می‌دهد..."
                value={data.problem}
                onChange={(e) => update("problem", e.target.value)}
              />
            </label>
            <div className="mt-5">
              <div className="text-sm font-bold">تصویر یا ویدیو (اختیاری)</div>
              <div className="mt-1 text-xs text-muted">حداکثر ۵ عکس یا ۱ ویدیو</div>
              <div className="mt-3 flex flex-wrap gap-3">
                {data.mediaFiles.map((file, i) => (
                  <div
                    key={i}
                    className="relative h-20 w-20 overflow-hidden rounded-2xl border border-line bg-canvas"
                  >
                    {file.isVideo ? (
                      <div className="flex h-full items-center justify-center text-muted">
                        <Icon name="orders" size="lg" />
                      </div>
                    ) : (
                      <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                    )}
                    <Button
                      className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-ink/75 text-white"
                      onClick={() =>
                        update(
                          "mediaFiles",
                          data.mediaFiles.filter((_, idx) => idx !== i),
                        )
                      }
                      label="حذف"
                    >
                      <Icon name="close" size="sm" />
                    </Button>
                  </div>
                ))}
                {data.mediaFiles.length < 5 && (
                  <Button
                    className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line text-xs font-bold text-muted hover:border-brand hover:text-brand"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon name="plus" />
                    افزودن
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleMediaAdd}
                />
              </div>
            </div>
            <Button className="primary-button mt-6 w-full justify-center" onClick={next}>
              مرحله بعد
            </Button>
          </StepCard>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <StepCard title="موقعیت مکانی" desc="محل نصب یا تعمیر دستگاه را مشخص کنید">
            <MapBg className="mt-5 h-52">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                <div className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-brand text-white shadow-lg">
                  <Icon name="pin" size="sm" />
                </div>
                <div className="mx-auto mt-0.5 h-2 w-0.5 bg-brand" />
              </div>
              <Button
                className="absolute right-3 top-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold shadow hover:text-brand"
                onClick={() => {}}
              >
                <Icon name="pin" size="sm" />
                موقعیت فعلی من
              </Button>
            </MapBg>

            <div className="mt-4 space-y-2">
              {savedAddresses.map((addr) => {
                const active = data.savedAddressId === addr.id;
                return (
                  <Button
                    key={addr.id}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-right transition-all ${active ? "border-brand bg-brand-soft" : "border-line bg-white hover:border-brand/40"}`}
                    onClick={() => update("savedAddressId", active ? null : addr.id)}
                  >
                    <span className="category-icon shrink-0">
                      <Icon name={addr.icon} size="sm" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-extrabold">{addr.label}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted">{addr.detail}</span>
                    </span>
                    {active && (
                      <span className="check-badge shrink-0">
                        <Icon name="check" size="sm" />
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>

            <label className="mt-4 block text-sm font-bold">
              جزئیات آدرس
              <textarea
                className="form-field mt-2 min-h-20 resize-none"
                placeholder="طبقه، واحد، نکات دسترسی..."
                value={data.addressDetails}
                onChange={(e) => update("addressDetails", e.target.value)}
              />
            </label>

            <Button className="primary-button mt-5 w-full justify-center" onClick={next}>
              مرحله بعد
            </Button>
          </StepCard>
        )}

        {/* Step 5: Time */}
        {step === 5 && (
          <StepCard title="زمان مراجعه" desc="چه زمانی برایتان مناسب است؟">
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(["asap", "scheduled"] as const).map((choice) => {
                const active = data.timeChoice === choice;
                return (
                  <Button
                    key={choice}
                    className={`service-option flex-col gap-3 py-6 ${active ? "border-brand bg-brand-soft" : ""}`}
                    onClick={() => update("timeChoice", choice)}
                  >
                    <span className={`category-icon ${active ? "bg-brand text-white" : ""}`}>
                      <Icon name={choice === "asap" ? "clock" : "orders"} />
                    </span>
                    <span className="font-extrabold text-center">
                      {choice === "asap" ? "در سریع‌ترین زمان" : "انتخاب تاریخ مشخص"}
                    </span>
                    {choice === "asap" && (
                      <span className="text-xs text-muted">معمولاً ۱ تا ۳ ساعت آینده</span>
                    )}
                  </Button>
                );
              })}
            </div>

            {data.timeChoice === "scheduled" && (
              <>
                {/* Jalali calendar */}
                <div className="mt-5 rounded-2xl border border-line bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <Button className="icon-action size-9">
                      <Icon name="arrow" size="sm" />
                    </Button>
                    <div className="font-black">آذر ۱۴۰۳</div>
                    <Button
                      className="icon-action size-9"
                      style={{ transform: "scaleX(-1)" }}
                    >
                      <Icon name="arrow" size="sm" />
                    </Button>
                  </div>
                  <div className="mb-2 grid grid-cols-7 text-center text-xs font-bold text-muted">
                    {jalaliDays.map((d) => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {Array.from({ length: jalaliDayOffset }).map((_, i) => (
                      <div key={`e${i}`} />
                    ))}
                    {Array.from({ length: jalaliDayCount }, (_, i) => i + 1).map((d) => {
                      const label = d.toLocaleString("fa-IR");
                      const isPast = d < todayDay;
                      const isToday = d === todayDay;
                      const isSelected = data.selectedDate === label;
                      return (
                        <Button
                          key={d}
                          disabled={isPast}
                          className={`rounded-xl py-2 text-xs font-bold transition-all
                            ${isPast ? "text-faint" : ""}
                            ${isToday && !isSelected ? "font-black text-brand underline underline-offset-2" : ""}
                            ${isSelected ? "bg-brand text-white" : !isPast ? "hover:bg-brand-soft hover:text-brand" : ""}
                          `}
                          onClick={() => update("selectedDate", label)}
                        >
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {data.selectedDate && (
                  <div className="mt-4">
                    <div className="mb-3 text-sm font-bold">بازه زمانی</div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot}
                          className={`rounded-xl border py-3 text-xs font-bold transition-all ${data.timeSlot === slot ? "border-brand bg-brand text-white" : "border-line bg-white hover:border-brand/40"}`}
                          onClick={() => update("timeSlot", slot)}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <Button
              className="primary-button mt-6 w-full justify-center"
              disabled={data.timeChoice === "scheduled" && !data.selectedDate}
              onClick={next}
            >
              مرحله بعد
            </Button>
          </StepCard>
        )}

        {/* Step 6: Technician selection */}
        {step === 6 && <TechnicianPicker data={data} update={update} onNext={next} />}

        {/* Step 7: Review & submit */}
        {step === 7 && <ReviewStep data={data} onSubmit={() => navigate("request-status")} />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// REQUEST STATUS SCREEN
// ─────────────────────────────────────────────

export function RequestStatusScreen({ navigate }: { navigate: Navigate }) {
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const tech = extendedTechnicians[0];

  const cancelReasons = [
    "تغییر برنامه",
    "مشکل خودش حل شد",
    "قیمت مناسب نبود",
    "پیدا کردن نصاب دیگر",
    "سایر دلایل",
  ];

  type Stage = { key: string; label: string; done: boolean; active: boolean; eta?: string };
  const stages: Stage[] = [
    { key: "submitted", label: "ثبت درخواست", done: true, active: false },
    { key: "accepted", label: "پذیرش توسط نصاب", done: true, active: false },
    {
      key: "quote",
      label: "پیشنهاد قیمت نصاب",
      done: false,
      active: true,
      eta: "در انتظار پاسخ شما",
    },
    { key: "enroute", label: "نصاب در راه است", done: false, active: false, eta: "تخمین ۳۵ دقیقه" },
    { key: "done", label: "پایان کار", done: false, active: false },
    { key: "payment", label: "پرداخت", done: false, active: false },
    { key: "rating", label: "امتیازدهی", done: false, active: false },
  ];

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <div className="mb-6 flex items-center gap-3">
        <Button className="icon-action" onClick={() => navigate("my-requests")} label="بازگشت">
          <Icon name="arrow" />
        </Button>
        <div>
          <div className="text-xl font-black sm:text-2xl">وضعیت درخواست</div>
          <div className="mt-1 text-xs text-muted">شماره درخواست: ۹۰۰۱</div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="surface-card">
            <div className="mb-5 font-black">مراحل درخواست</div>
            {stages.map((stage, i) => (
              <div key={stage.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-black transition-colors ${
                      stage.done
                        ? "bg-brand text-white"
                        : stage.active
                        ? "bg-brand-soft text-brand ring-2 ring-brand/30"
                        : "bg-line text-muted"
                    }`}
                  >
                    {stage.done ? <Icon name="check" size="sm" /> : (i + 1).toLocaleString("fa-IR")}
                  </div>
                  {i < stages.length - 1 && (
                    <div
                      className={`mt-1 min-h-8 w-0.5 flex-1 transition-colors ${stage.done ? "bg-brand" : "bg-line"}`}
                    />
                  )}
                </div>
                <div className="flex-1 pb-5 pt-0.5">
                  <div
                    className={`flex flex-wrap items-center gap-2 text-sm font-bold ${
                      stage.active ? "text-brand" : stage.done ? "text-ink" : "text-muted"
                    }`}
                  >
                    {stage.label}
                    {stage.active && (
                      <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand">
                        <span className="pulse-dot" />
                        فعال
                      </span>
                    )}
                  </div>
                  {stage.eta && !stage.active && (
                    <div className="mt-0.5 text-xs text-muted">{stage.eta}</div>
                  )}
                  {stage.active && stage.key === "quote" && (
                    <div className="mt-3 rounded-2xl border border-brand/20 bg-brand-soft p-4">
                      <div className="text-sm font-black">پیشنهاد قیمت نصاب</div>
                      <div className="mt-2 text-2xl font-black">{formatPrice(970000)}</div>
                      <div className="mt-1 text-xs text-muted">
                        دستمزد {formatPrice(650000)} + قطعات {formatPrice(320000)}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          className="primary-button flex-1 justify-center text-sm"
                          onClick={() => navigate("payment")}
                        >
                          پذیرش و پرداخت
                        </Button>
                        <Button className="secondary-button px-4 text-sm" onClick={() => {}}>
                          رد کردن
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Technician card */}
          <div className="surface-card">
            <div className="mb-4 font-black">نصاب شما</div>
            <div className="flex items-center gap-3">
              <span className="avatar avatar-1 shrink-0">
                <Icon name="user" />
              </span>
              <div className="flex-1">
                <div className="font-black">{tech.name}</div>
                <div className="mt-0.5 text-xs text-muted">{tech.skill}</div>
                <div className="mt-1.5 rating w-fit">
                  <Icon name="star" size="sm" />
                  {tech.rating.toLocaleString("fa-IR")}
                </div>
              </div>
            </div>
            <Button
              className="secondary-button mt-4 w-full justify-center"
              onClick={() => navigate("technician-detail", tech.id)}
            >
              مشاهده پروفایل
            </Button>
            <div className="mt-3 rounded-2xl bg-canvas px-3 py-4 text-center text-xs">
              <div className="font-bold">تماس با نصاب</div>
              <div className="mt-1 font-black text-brand">۰۹۱۲ — — — ۷</div>
              <div className="mt-1 text-muted">شماره شما برای نصاب نمایش داده نمی‌شود</div>
            </div>
          </div>

          {/* Cancel */}
          <Button
            className="w-full rounded-2xl border border-red-200 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50"
            onClick={() => setShowCancel(true)}
          >
            لغو درخواست
          </Button>
        </div>
      </div>

      {/* Cancel modal */}
      {showCancel && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setShowCancel(false)}
        >
          <div className="request-modal">
            <div className="flex items-start justify-between gap-4">
              <div className="text-xl font-black">لغو درخواست</div>
              <Button className="icon-action" onClick={() => setShowCancel(false)} label="بستن">
                <Icon name="close" />
              </Button>
            </div>
            <div className="mt-5 space-y-2">
              {cancelReasons.map((r) => (
                <Button
                  key={r}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-right text-sm font-bold transition-all ${cancelReason === r ? "border-red-400 bg-red-50 text-red-600" : "border-line bg-canvas hover:border-red-200"}`}
                  onClick={() => setCancelReason(r)}
                >
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${cancelReason === r ? "border-red-400 bg-red-400" : "border-faint"}`}
                  >
                    {cancelReason === r && <span className="size-2 rounded-full bg-white" />}
                  </span>
                  {r}
                </Button>
              ))}
            </div>
            <Button
              className="mt-5 w-full rounded-2xl bg-red-600 py-3.5 text-sm font-extrabold text-white hover:bg-red-700 disabled:opacity-40"
              disabled={!cancelReason}
              onClick={() => { setShowCancel(false); navigate("my-requests"); }}
            >
              تأیید لغو درخواست
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

// ─────────────────────────────────────────────
// TECHNICIAN DETAIL SCREEN
// ─────────────────────────────────────────────

export function TechnicianDetailScreen({
  navigate,
  technicianId,
}: {
  navigate: Navigate;
  technicianId: number;
}) {
  const tech = extendedTechnicians.find((t) => t.id === technicianId) ?? extendedTechnicians[0];
  const total = tech.ratingBreakdown.reduce((a, b) => a + b, 0);

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <div className="mb-6 flex items-center gap-3">
        <Button className="icon-action" onClick={() => navigate("technicians")} label="بازگشت">
          <Icon name="arrow" />
        </Button>
        <div className="text-xl font-black sm:text-2xl">پروفایل متخصص</div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left/Main */}
        <div className="space-y-5 lg:col-span-2">
          {/* Hero card */}
          <div className="surface-card">
            <div className="flex flex-wrap items-start gap-4">
              <span className="avatar avatar-1 size-20 shrink-0 text-3xl">
                <Icon name="user" size="lg" />
              </span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xl font-black">{tech.name}</div>
                  <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">
                    <Icon name="shield" size="sm" /> تأییدشده
                  </span>
                </div>
                <div className="mt-1 text-sm font-bold text-muted">{tech.skill}</div>
                <div className="mt-0.5 text-xs text-muted">
                  {tech.city} · {tech.area}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tech.specialties.map((s) => (
                    <span key={s} className="rounded-lg bg-canvas px-2 py-1 text-xs font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-3 border-t border-line pt-5 text-center">
              {[
                { v: tech.rating.toLocaleString("fa-IR"), l: "امتیاز" },
                { v: formatNumber(tech.jobs), l: "پروژه" },
                { v: `${formatNumber(tech.acceptance)}٪`, l: "پذیرش" },
                { v: `${formatNumber(tech.experience)} سال`, l: "تجربه" },
              ].map((m) => (
                <div key={m.l}>
                  <div className="text-lg font-black">{m.v}</div>
                  <div className="mt-1 text-xs text-muted">{m.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating breakdown */}
          <div className="surface-card">
            <div className="mb-4 font-black">توزیع امتیازات</div>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map((star, i) => {
                const count = tech.ratingBreakdown[i];
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex w-8 shrink-0 items-center gap-0.5 text-xs font-bold text-amber-600">
                      <Icon name="star" size="sm" />
                      {star}
                    </div>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-8 shrink-0 text-xs text-muted">{formatNumber(count)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews */}
          <div className="surface-card">
            <div className="mb-4 font-black">نظرات مشتریان</div>
            <div className="space-y-4">
              {tech.techReviews.map((r, i) => (
                <div
                  key={i}
                  className={`pb-4 ${i < tech.techReviews.length - 1 ? "border-b border-line" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold">{r.author}</div>
                    <div className="rating">
                      <Icon name="star" size="sm" />
                      {r.rating}
                    </div>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-muted">{r.text}</div>
                  <div className="mt-1 text-xs text-faint">{r.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Service area map */}
          <MapBg className="h-40">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 p-8">
              <div className="flex size-8 items-center justify-center rounded-full bg-brand text-white shadow-lg">
                <Icon name="user" size="sm" />
              </div>
            </div>
            <div className="absolute bottom-2 left-0 right-0 text-center text-xs font-bold text-muted/70">
              محدوده تقریبی سرویس‌دهی
            </div>
          </MapBg>

          {/* Tariffs */}
          <div className="surface-card">
            <div className="mb-4 font-black">تعرفه خدمات</div>
            <div className="space-y-3">
              {tech.tariffs.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center justify-between gap-3 border-b border-line pb-3 text-sm last:border-0 last:pb-0"
                >
                  <span className="text-muted">{t.label}</span>
                  <span className="shrink-0 font-bold">{formatPrice(t.price)}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            className="primary-button w-full justify-center"
            onClick={() => navigate("service-wizard")}
          >
            <Icon name="tool" />
            درخواست از این نصاب
          </Button>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// PAYMENT SCREEN
// ─────────────────────────────────────────────

export function PaymentScreen({ navigate }: { navigate: Navigate }) {
  const laborPrice = 650000;
  const partsPrice = 320000;
  const total = laborPrice + partsPrice;

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <div className="mb-6 flex items-center gap-3">
        <Button className="icon-action" onClick={() => navigate("request-status")} label="بازگشت">
          <Icon name="arrow" />
        </Button>
        <div>
          <div className="text-xl font-black sm:text-2xl">پرداخت هزینه خدمات</div>
          <div className="mt-1 text-xs text-muted">فاکتور نهایی</div>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-4">
        {/* Invoice */}
        <div className="surface-card">
          <div className="mb-5 font-black">جزئیات فاکتور</div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">دستمزد نصاب</span>
              <span className="font-bold">{formatPrice(laborPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">هزینه قطعات</span>
              <span className="font-bold">{formatPrice(partsPrice)}</span>
            </div>
            <div className="rounded-2xl bg-canvas p-3 text-xs text-muted">
              قطعات از انبار گروه حنیفی با ضمانت اصالت تأمین شده است.
            </div>
            <div className="flex items-center justify-between border-t border-line pt-3 text-base font-black">
              <span>مبلغ قابل پرداخت</span>
              <span className="text-brand">{formatPrice(total)}</span>
            </div>
          </div>

          <Button
            className="primary-button mt-6 w-full justify-center"
            onClick={() => navigate("payment-gateway")}
          >
            <Icon name="wallet" />
            پرداخت آنلاین
          </Button>
          <div className="mt-3 text-center text-xs text-muted">
            درگاه پرداخت امن · SSL رمزنگاری‌شده
          </div>
        </div>

        {/* Tech card summary */}
        <div className="surface-card flex items-center gap-3">
          <span className="avatar avatar-1 shrink-0">
            <Icon name="user" />
          </span>
          <div>
            <div className="font-black">{extendedTechnicians[0].name}</div>
            <div className="text-xs text-muted">{extendedTechnicians[0].skill}</div>
          </div>
          <div className="mr-auto rating">
            <Icon name="star" size="sm" />
            {extendedTechnicians[0].rating.toLocaleString("fa-IR")}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// MOCK BANK GATEWAY
// ─────────────────────────────────────────────

export function PaymentGatewayScreen({ navigate }: { navigate: Navigate }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    window.setTimeout(() => navigate("payment-success"), 2200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a2f5a] p-4" dir="rtl">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#1a2f5a] text-white">
            <Icon name="shield" />
          </div>
          <div className="font-black text-[#1a2f5a]">درگاه پرداخت امن</div>
          <div className="mt-1 text-xs text-muted">بانک ملت · خدمات الکترونیک</div>
        </div>

        <div className="mb-5 rounded-2xl bg-canvas p-4 text-center">
          <div className="text-xs text-muted">مبلغ قابل پرداخت</div>
          <div className="mt-1 text-2xl font-black">{formatPrice(970000)}</div>
          <div className="mt-1 text-xs text-muted">گروه فنی صنعتی حنیفی</div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-muted">
            شماره کارت
            <input
              className="form-field mt-1 text-center font-mono tracking-widest"
              placeholder="۱۲۳۴ — ۵۶۷۸ — ۹۰۱۲ — ۳۴۵۶"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              maxLength={19}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-bold text-muted">
              تاریخ انقضا
              <input
                className="form-field mt-1 text-center"
                placeholder="ماه / سال"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </label>
            <label className="block text-xs font-bold text-muted">
              CVV2
              <input
                className="form-field mt-1 text-center font-mono"
                placeholder="—  —  —"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </label>
          </div>
        </div>

        <Button
          className="primary-button mt-5 w-full justify-center"
          disabled={processing}
          onClick={handlePay}
        >
          {processing ? "در حال پرداخت..." : "پرداخت کن"}
        </Button>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
          <Icon name="shield" size="sm" />
          اطلاعات شما رمزنگاری شده است
        </div>

        <Button
          className="mt-3 w-full py-2 text-center text-xs text-muted hover:text-red-500"
          onClick={() => navigate("payment-failure")}
        >
          شبیه‌سازی خطای پرداخت
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAYMENT SUCCESS
// ─────────────────────────────────────────────

export function PaymentSuccessScreen({ navigate }: { navigate: Navigate }) {
  return (
    <main className="page-wrap flex min-h-screen items-center justify-center py-10">
      <div className="mx-auto max-w-sm text-center">
        <div className="mx-auto mb-5 flex size-24 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Icon name="check" size="lg" />
        </div>
        <div className="text-2xl font-black">پرداخت موفق!</div>
        <div className="mt-3 text-sm leading-7 text-muted">
          مبلغ {formatPrice(970000)} با موفقیت پرداخت شد.
          <br />
          شماره پیگیری: ۱۴۰۳۱۱۲۲۸۷۴۳
        </div>
        <div className="mt-8 space-y-3">
          <Button className="primary-button w-full justify-center" onClick={() => navigate("rating")}>
            ثبت نظر و امتیازدهی
          </Button>
          <Button
            className="secondary-button w-full justify-center"
            onClick={() => navigate("my-requests")}
          >
            بازگشت به درخواست‌ها
          </Button>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// PAYMENT FAILURE
// ─────────────────────────────────────────────

export function PaymentFailureScreen({ navigate }: { navigate: Navigate }) {
  return (
    <main className="page-wrap flex min-h-screen items-center justify-center py-10">
      <div className="mx-auto max-w-sm text-center">
        <div className="mx-auto mb-5 flex size-24 items-center justify-center rounded-full bg-red-50 text-red-500">
          <Icon name="close" size="lg" />
        </div>
        <div className="text-2xl font-black">پرداخت ناموفق</div>
        <div className="mt-3 text-sm leading-7 text-muted">
          متأسفانه پرداخت انجام نشد.
          <br />
          مشکلی در ارتباط با درگاه وجود داشت.
        </div>
        <div className="mt-8 space-y-3">
          <Button
            className="primary-button w-full justify-center"
            onClick={() => navigate("payment-gateway")}
          >
            تلاش مجدد
          </Button>
          <Button
            className="secondary-button w-full justify-center"
            onClick={() => navigate("request-status")}
          >
            بازگشت به وضعیت درخواست
          </Button>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// RATING SCREEN
// ─────────────────────────────────────────────

export function RatingScreen({ navigate }: { navigate: Navigate }) {
  const [stars, setStars] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const quickTags = ["به‌موقع", "مؤدب", "کار تمیز", "قیمت منصفانه"];
  const starLabels = ["", "خیلی بد", "بد", "متوسط", "خوب", "عالی"];

  const toggleTag = (tag: string) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  if (submitted) {
    return (
      <main className="page-wrap flex min-h-screen items-center justify-center py-10">
        <div className="mx-auto max-w-sm text-center">
          <div className="mx-auto mb-5 flex size-24 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <Icon name="star" size="lg" />
          </div>
          <div className="text-2xl font-black">امتیاز ثبت شد!</div>
          <div className="mt-3 text-sm text-muted">از بازخورد شما سپاسگزاریم.</div>
          <Button
            className="primary-button mx-auto mt-8 justify-center"
            onClick={() => navigate("home")}
          >
            بازگشت به خانه
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <div className="mb-6 flex items-center gap-3">
        <Button className="icon-action" onClick={() => navigate("my-requests")} label="بازگشت">
          <Icon name="arrow" />
        </Button>
        <div className="text-xl font-black sm:text-2xl">ثبت نظر و امتیاز</div>
      </div>

      <div className="mx-auto max-w-lg">
        <div className="surface-card">
          {/* Technician header */}
          <div className="mb-6 flex items-center gap-3">
            <span className="avatar avatar-1 shrink-0">
              <Icon name="user" />
            </span>
            <div>
              <div className="font-black">{extendedTechnicians[0].name}</div>
              <div className="text-xs text-muted">{extendedTechnicians[0].skill}</div>
            </div>
            <div className="mr-auto text-xs text-muted">تعمیر پمپ آب · ۱۸ آبان</div>
          </div>

          {/* Star selector */}
          <div className="text-center">
            <div className="mb-3 text-sm font-black">چند ستاره؟</div>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`cursor-pointer text-4xl transition-all duration-150 hover:scale-110 active:scale-95 ${
                    star <= (hoverStar || stars) ? "text-amber-400" : "text-line"
                  }`}
                  onMouseEnter={() => setHoverStar(star)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => setStars(star)}
                  aria-label={`${star} ستاره`}
                >
                  ★
                </button>
              ))}
            </div>
            {stars > 0 && (
              <div className="mt-2 text-sm font-bold text-muted">{starLabels[stars]}</div>
            )}
          </div>

          {/* Quick tags */}
          <div className="mt-6">
            <div className="mb-3 text-sm font-black">برچسب‌های سریع</div>
            <div className="flex flex-wrap gap-2">
              {quickTags.map((tag) => (
                <Button
                  key={tag}
                  className={`rounded-xl border px-3 py-2 text-sm font-bold transition-all ${
                    tags.includes(tag)
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-line bg-white text-muted hover:border-brand/40"
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tags.includes(tag) && "✓ "}
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <label className="form-label mt-5">
            توضیحات (اختیاری)
            <textarea
              className="form-field mt-2 min-h-24 resize-none"
              placeholder="تجربه خود را بنویسید..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </label>

          <Button
            className="primary-button mt-5 w-full justify-center"
            disabled={stars === 0}
            onClick={() => setSubmitted(true)}
          >
            ثبت نظر
          </Button>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// MY REQUESTS SCREEN
// ─────────────────────────────────────────────

const statusLabel: Record<string, string> = {
  waiting: "در انتظار پذیرش",
  accepted: "پذیرفته‌شده",
  quote: "در انتظار تأیید قیمت",
  enroute: "نصاب در راه",
  done: "انجام‌شده",
  paid: "پرداخت‌شده",
  rated: "تکمیل‌شده",
  cancelled: "لغوشده",
};

const statusColor: Record<string, string> = {
  waiting: "bg-brand-soft text-brand",
  accepted: "bg-brand-soft text-brand",
  quote: "bg-amber-50 text-amber-700",
  enroute: "bg-sky-50 text-sky-700",
  done: "bg-brand-soft text-brand",
  paid: "bg-brand-soft text-brand",
  rated: "bg-brand-soft text-brand",
  cancelled: "bg-red-50 text-red-600",
};

export function MyRequestsScreen({ navigate }: { navigate: Navigate }) {
  const [tab, setTab] = useState<"active" | "done" | "cancelled">("active");

  const tabData = {
    active: myServiceRequests.filter((r) => ["waiting", "accepted", "quote", "enroute"].includes(r.status)),
    done: myServiceRequests.filter((r) => ["done", "paid", "rated"].includes(r.status)),
    cancelled: myServiceRequests.filter((r) => r.status === "cancelled"),
  };

  const tabs: { key: "active" | "done" | "cancelled"; label: string; count: number }[] = [
    { key: "active", label: "فعال", count: tabData.active.length },
    { key: "done", label: "تکمیل‌شده", count: tabData.done.length },
    { key: "cancelled", label: "لغوشده", count: tabData.cancelled.length },
  ];

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <div className="mb-6 flex items-center gap-3">
        <Button className="icon-action" onClick={() => navigate("home")} label="بازگشت">
          <Icon name="arrow" />
        </Button>
        <div>
          <div className="text-xl font-black sm:text-2xl">درخواست‌های من</div>
          <div className="mt-1 text-xs text-muted">پیگیری همه درخواست‌های خدمت</div>
        </div>
        <Button
          className="primary-button mr-auto text-sm"
          onClick={() => navigate("service-wizard")}
        >
          <Icon name="plus" size="sm" />
          درخواست جدید
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-line bg-canvas p-1 w-fit">
        {tabs.map((t) => (
          <Button
            key={t.key}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
              tab === t.key ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
            }`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-black ${
                  tab === t.key ? "bg-brand text-white" : "bg-line text-muted"
                }`}
              >
                {formatNumber(t.count)}
              </span>
            )}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {tabData[tab].length === 0 ? (
          <div className="surface-card py-12 text-center">
            <div className="success-mark mx-auto">
              <Icon name="orders" />
            </div>
            <div className="mt-4 font-black">درخواستی در این بخش وجود ندارد</div>
            <Button
              className="primary-button mx-auto mt-5 justify-center"
              onClick={() => navigate("service-wizard")}
            >
              ثبت درخواست جدید
            </Button>
          </div>
        ) : (
          tabData[tab].map((req) => {
            const tech = req.technicianId
              ? extendedTechnicians.find((t) => t.id === req.technicianId)
              : null;
            const techIndex = tech ? extendedTechnicians.indexOf(tech) : 0;
            return (
              <Button
                key={req.id}
                className="surface-card w-full text-right hover:border-brand/30"
                onClick={() => navigate("request-status")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">
                      {req.serviceType} {req.deviceType}
                    </div>
                    <div className="mt-1 text-xs text-muted">شماره {formatNumber(req.id)}</div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${statusColor[req.status] ?? "bg-canvas text-muted"}`}
                  >
                    {statusLabel[req.status] ?? req.status}
                  </span>
                </div>
                {tech && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`avatar avatar-${(techIndex % 3) + 1} size-7 text-xs`}>
                      <Icon name="user" size="sm" />
                    </span>
                    <span className="text-sm text-muted">{tech.name}</span>
                    <span className="rating mr-auto text-xs">
                      <Icon name="star" size="sm" />
                      {tech.rating.toLocaleString("fa-IR")}
                    </span>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
                  <span>{req.createdAt}</span>
                  <span>·</span>
                  <span>{req.scheduledTime}</span>
                </div>
                {req.status === "quote" && (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 text-sm">
                    <span className="font-bold text-amber-700">پیشنهاد قیمت ارسال شد</span>
                    <span className="font-black text-amber-700">
                      {formatPrice(req.laborPrice + req.partsPrice)}
                    </span>
                  </div>
                )}
              </Button>
            );
          })
        )}
      </div>
    </main>
  );
}
