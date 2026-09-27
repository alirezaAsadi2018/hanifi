import { useRef, useState } from "react";
import { Button, ConfirmDialog, formatDecimal, formatNumber, formatPrice, Modal, formatId } from "../components/ui";
import Icon, { type IconName } from "../components/Icon";
import { MapBg, MapPicker } from "../components/MapPicker";
import { categories, extendedTechnicians, myServiceRequests, requestStatusLabel } from "../data/mock";
import { formatJalaliLong, isSameDay, jalaliMonth, weekDays } from "../lib/jalali";
import { useApp } from "../state";
import { LoginFlow } from "./AccountScreens";

// ─────────────────────────────────────────────
// Shared local data
// ─────────────────────────────────────────────

const savedAddresses = [
  { id: 1, label: "منزل", icon: "home" as IconName, detail: "سعادت‌آباد، خیابان دانشجو، پلاک ۱۲" },
  { id: 2, label: "محل کار", icon: "box" as IconName, detail: "جاده مخصوص، شهرک صنعتی واحد ۴" },
];

const timeSlots = ["۸ تا ۱۱", "۱۱ تا ۱۴", "۱۴ تا ۱۷", "۱۷ تا ۲۰"];
const today = new Date();

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
  mapLabel: string;
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
                border: "1px solid rgba(0,0,0,.12)",
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
                  <span>⭐ {formatDecimal(tech.rating)}</span>
                  <span>{formatNumber(tech.jobs)} پروژه</span>
                  <span>{formatNumber(tech.acceptance)}٪ پذیرش</span>
                  <span>حدود {formatDecimal(tech.distance)} کیلومتر</span>
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
      value: [addr ? `${addr.label}: ${addr.detail}` : data.mapLabel || "موقعیت روی نقشه", data.addressDetails].filter(Boolean).join(" — "),
    },
    {
      label: "زمان",
      value:
        data.timeChoice === "asap"
          ? "در سریع‌ترین زمان"
          : `${data.selectedDate} — ساعت ${data.timeSlot}`,
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

export function ServiceWizardScreen() {
  const { navigate, back: leave, servicePrefill, user, login, toast } = useApp();
  const TOTAL = 7;
  const fileInputRef = useRef<HTMLInputElement>(null);
  // A chip / product page / technician profile may already have answered the first steps.
  const [step, setStep] = useState(servicePrefill.service ? (servicePrefill.device ? 3 : 2) : 1);
  const [monthOffset, setMonthOffset] = useState(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [data, setData] = useState<WizardData>({
    serviceType: servicePrefill.service ?? "",
    deviceType: servicePrefill.device ?? "",
    brand: "",
    model: "",
    problem: "",
    mediaFiles: [],
    savedAddressId: 1,
    mapLabel: "",
    addressDetails: "",
    timeChoice: "asap",
    selectedDate: "",
    timeSlot: timeSlots[0],
    technicianId: servicePrefill.technicianId ?? null,
  });
  const month = jalaliMonth(today, monthOffset);
  const submit = () => {
    if (!user) { setLoginOpen(true); return; }
    toast("درخواست ثبت شد و برای نصاب‌ها ارسال شد");
    navigate("request-status", 1);
  };

  const update = <K extends keyof WizardData>(key: K, value: WizardData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const next = () => setStep((s) => Math.min(s + 1, TOTAL));
  const back = () => {
    if (step > 1) setStep((s) => s - 1);
    else leave();
  };

  const handleMediaAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    // Up to 5 photos, or a single video on its own.
    if (files.some((f) => f.type.startsWith("video"))) {
      const video = files.find((f) => f.type.startsWith("video"))!;
      update("mediaFiles", [{ url: URL.createObjectURL(video), name: video.name, isVideo: true }]);
      e.target.value = "";
      return;
    }
    const kept = data.mediaFiles.filter((f) => !f.isVideo);
    const newFiles = files
      .slice(0, 5 - kept.length)
      .map((f) => ({ url: URL.createObjectURL(f), name: f.name, isVideo: f.type.startsWith("video") }));
    update("mediaFiles", [...kept, ...newFiles]);
    e.target.value = "";
  };

  const serviceTypes = ["نصب", "تعمیر", "عیب‌یابی", "سرویس دوره‌ای"];

  return (
    <div className="min-h-screen bg-canvas pb-24" dir="rtl">
      {/* Sticky header with step indicator */}
      <div className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Button className="icon-action shrink-0" onClick={back} label="بازگشت">
            <Icon name="back" />
          </Button>
          <div className="flex-1">
            <div className="text-sm font-black">ثبت درخواست خدمت</div>
            <div className="mt-0.5 text-xs text-muted">
              مرحله {step.toLocaleString("fa-IR")} از {TOTAL.toLocaleString("fa-IR")}
            </div>
          </div>
          <div className="shrink-0 text-xs font-bold text-brand">
            {formatNumber(Math.round((step / TOTAL) * 100))}٪
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
                {data.mediaFiles.length < 5 && !data.mediaFiles.some((f) => f.isVideo) && (
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
            <MapPicker className="mt-5 h-52" onChange={(label) => { update("mapLabel", label); update("savedAddressId", null); }} />

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

            <Button className="primary-button mt-5 w-full justify-center" disabled={!data.savedAddressId && !data.mapLabel} onClick={next}>
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
                {/* Jalali calendar (real dates via Intl) */}
                <div className="mt-5 rounded-2xl border border-line bg-white p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <Button className="icon-action size-9" style={{ transform: "scaleX(-1)" }} disabled={monthOffset === 0} onClick={() => setMonthOffset(monthOffset - 1)} label="ماه قبل">
                      <Icon name="arrow" size="sm" />
                    </Button>
                    <div className="font-black">{month.title}</div>
                    <Button className="icon-action size-9" disabled={monthOffset >= 2} onClick={() => setMonthOffset(monthOffset + 1)} label="ماه بعد">
                      <Icon name="arrow" size="sm" />
                    </Button>
                  </div>
                  <div className="mb-2 grid grid-cols-7 text-center text-xs font-bold text-muted">
                    {weekDays.map((d) => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {Array.from({ length: month.leading }).map((_, i) => (
                      <div key={`e${i}`} />
                    ))}
                    {month.days.map((day) => {
                      const label = formatJalaliLong(day);
                      const isPast = day < today && !isSameDay(day, today);
                      const isToday = isSameDay(day, today);
                      const isFriday = day.getDay() === 5;
                      const isSelected = data.selectedDate === label;
                      return (
                        <Button
                          key={day.toISOString()}
                          disabled={isPast}
                          label={label}
                          className={`rounded-xl py-2 text-xs font-bold transition-all
                            ${isPast ? "text-faint" : isFriday ? "text-red-500" : ""}
                            ${isToday && !isSelected ? "font-black text-brand underline underline-offset-2" : ""}
                            ${isSelected ? "bg-brand text-white" : !isPast ? "hover:bg-brand-soft hover:text-brand" : ""}
                          `}
                          onClick={() => update("selectedDate", label)}
                        >
                          {day.toLocaleDateString("fa-IR-u-ca-persian", { day: "numeric" })}
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
        {step === 7 && <ReviewStep data={data} onSubmit={submit} />}
      </div>
      <Modal open={loginOpen} onClose={() => setLoginOpen(false)} title="برای ثبت درخواست وارد شوید" subtitle="اطلاعات درخواست شما حفظ می‌شود.">
        <LoginFlow compact onDone={(u) => { login(u, true); setLoginOpen(false); navigate("request-status", 1); }} />
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────
// REQUEST STATUS SCREEN
// ─────────────────────────────────────────────

const lifecycle = [
  { key: "waiting", label: "در انتظار پذیرش" },
  { key: "accepted", label: "پذیرفته شد" },
  { key: "quote", label: "پیشنهاد قیمت نصاب" },
  { key: "enroute", label: "نصاب در راه است" },
  { key: "working", label: "در حال انجام" },
  { key: "done", label: "پایان کار" },
  { key: "payment", label: "پرداخت" },
  { key: "rating", label: "امتیازدهی" },
] as const;

const LABOR = 650000;
const PARTS = 320000;

export function RequestStatusScreen() {
  const { navigate, param, startPayment, toast } = useApp();
  // param 1 = just submitted from the wizard; otherwise the existing request 9001 waiting on a quote.
  const [stage, setStage] = useState(param === 1 ? 0 : 2);
  const [rejectedBy, setRejectedBy] = useState(false);
  const [quoteRejected, setQuoteRejected] = useState(false);
  const [techId, setTechId] = useState(1);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [quoteRejectOpen, setQuoteRejectOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const tech = extendedTechnicians.find((t) => t.id === techId)!;
  const alternatives = extendedTechnicians.filter((t) => t.status === "آنلاین" && t.id !== techId);
  const accepted = stage >= 1 && !rejectedBy;
  const current = lifecycle[stage].key;

  const advance = () => {
    setRejectedBy(false);
    setQuoteRejected(false);
    setStage((value) => Math.min(value + 1, lifecycle.length - 1));
  };

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <div className="mb-6 flex items-center gap-3">
        <Button className="icon-action" onClick={() => navigate("my-requests")} label="بازگشت">
          <Icon name="back" />
        </Button>
        <div>
          <div className="text-xl font-black sm:text-2xl">وضعیت درخواست</div>
          <div className="mt-1 text-xs text-muted">شماره درخواست: ۹۰۰۱ · تعمیر پمپ آب</div>
        </div>
      </div>

      <div className="demo-bar mb-5">
        <span className="font-black">پیش‌نمایش:</span>
        <Button className="demo-chip" disabled={stage >= lifecycle.length - 1} onClick={advance}>مرحله بعد ←</Button>
        <Button className="demo-chip" onClick={() => { setStage(0); setRejectedBy(true); }}>رد درخواست توسط نصاب</Button>
        <Button className="demo-chip" onClick={() => { setStage(2); setRejectedBy(false); setQuoteRejected(false); }}>بازگشت به پیشنهاد قیمت</Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="surface-card">
            <div className="mb-5 font-black">مراحل درخواست</div>
            {lifecycle.map((item, i) => {
              const done = i < stage;
              const active = i === stage;
              const label = item.key === "accepted" && rejectedBy ? "رد شد" : item.key === "accepted" && i < stage ? `پذیرفته شد توسط ${tech.name}` : item.label;
              return (
                <div key={item.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-black transition-colors ${done ? "bg-brand text-white" : active ? "bg-brand-soft text-brand ring-2 ring-brand/30" : "bg-line text-muted"}`}>
                      {done ? <Icon name="check" size="sm" /> : formatNumber(i + 1)}
                    </div>
                    {i < lifecycle.length - 1 && <div className={`mt-1 min-h-6 w-0.5 flex-1 transition-colors ${done ? "bg-brand" : "bg-line"}`} />}
                  </div>
                  <div className="min-w-0 flex-1 pb-5 pt-0.5">
                    <div className={`flex flex-wrap items-center gap-2 text-sm font-bold ${active ? "text-brand" : done ? "text-ink" : "text-muted"}`}>
                      {label}
                      {active && <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand"><span className="pulse-dot" />فعال</span>}
                    </div>

                    {active && current === "waiting" && !rejectedBy && (
                      <div className="mt-3 rounded-2xl bg-canvas p-4 text-sm text-muted">درخواست برای {formatNumber(alternatives.length + 1)} نصاب آنلاین نزدیک ارسال شد. معمولاً کمتر از ۵ دقیقه پاسخ می‌دهند.</div>
                    )}
                    {active && current === "waiting" && rejectedBy && (
                      <div className="mt-3 rounded-2xl border border-red-200 bg-red-50/60 p-4">
                        <div className="text-sm font-black text-red-700">{tech.name} امکان انجام این درخواست را ندارد</div>
                        <div className="mt-1 text-xs text-red-700/80">دلیل: خارج از ساعت کاری در زمان انتخاب‌شده</div>
                        <div className="mt-4 text-sm font-bold">نصاب‌های پیشنهادی دیگر:</div>
                        <div className="mt-2 space-y-2">
                          {alternatives.map((alt) => (
                            <div key={alt.id} className="flex items-center gap-3 rounded-xl bg-white p-3">
                              <span className="avatar avatar-2 size-9"><Icon name="user" size="sm" /></span>
                              <div className="min-w-0 flex-1"><div className="text-sm font-black">{alt.name}</div><div className="text-xs text-muted">⭐ {formatDecimal(alt.rating)} · حدود {formatDecimal(alt.distance)} کیلومتر</div></div>
                              <Button className="rounded-xl bg-brand px-3 py-2 text-xs font-black text-white" onClick={() => { setTechId(alt.id); setRejectedBy(false); toast(`درخواست برای ${alt.name} ارسال شد`); }}>ارسال</Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {active && current === "quote" && !quoteRejected && (
                      <div className="mt-3 rounded-2xl border border-brand/20 bg-brand-soft p-4">
                        <div className="text-sm font-black">پیشنهاد قیمت {tech.name}</div>
                        <div className="mt-2 text-2xl font-black">{formatPrice(LABOR + PARTS)}</div>
                        <div className="mt-1 text-xs text-muted">دستمزد {formatPrice(LABOR)} + قطعات {formatPrice(PARTS)} (تعویض مکانیکال‌سیل)</div>
                        <div className="mt-1 text-xs text-muted">پرداخت پس از پایان کار انجام می‌شود.</div>
                        <div className="mt-4 flex gap-2">
                          <Button className="primary-button h-11 flex-1 justify-center text-sm" onClick={() => { advance(); toast("پیشنهاد قیمت تأیید شد؛ نصاب حرکت می‌کند"); }}>تأیید پیشنهاد</Button>
                          <Button className="secondary-button h-11 px-4 text-sm" onClick={() => setQuoteRejectOpen(true)}>رد کردن</Button>
                        </div>
                      </div>
                    )}
                    {active && current === "quote" && quoteRejected && (
                      <div className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">
                        پیشنهاد رد شد و برای نصاب ارسال شد. می‌توانید منتظر پیشنهاد جدید بمانید یا نصاب دیگری انتخاب کنید.
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button className="rounded-xl bg-white px-3 py-2 text-xs font-black text-amber-800" onClick={() => { setQuoteRejected(false); toast("پیشنهاد جدید دریافت شد"); }}>شبیه‌سازی پیشنهاد جدید</Button>
                          <Button className="rounded-xl bg-white px-3 py-2 text-xs font-black text-amber-800" onClick={() => { setStage(0); setRejectedBy(true); }}>انتخاب نصاب دیگر</Button>
                        </div>
                      </div>
                    )}

                    {active && current === "enroute" && (
                      <MapBg className="mt-3 h-36">
                        <div className="tech-zone tech-zone-online" style={{ left: "35%", top: "40%", width: 70, height: 70 }} />
                        <div className="absolute left-2/3 top-1/2 -translate-x-1/2 -translate-y-full"><div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-ink text-white shadow-lg"><Icon name="home" size="sm" /></div></div>
                        <div className="absolute bottom-2 right-2 rounded-xl bg-white/95 px-3 py-2 text-xs font-bold shadow">زمان تقریبی رسیدن: ۲۵ دقیقه</div>
                      </MapBg>
                    )}
                    {active && current === "working" && <div className="mt-2 text-xs text-muted">نصاب کار را از ساعت ۱۷:۱۰ شروع کرده است.</div>}
                    {active && (current === "done" || current === "payment") && (
                      <div className="mt-3 rounded-2xl border border-brand/20 bg-brand-soft p-4">
                        <div className="text-sm font-black">کار انجام شد؛ فاکتور نهایی آماده است</div>
                        <div className="mt-1 text-xs text-muted">دستمزد {formatPrice(LABOR)} + قطعات {formatPrice(PARTS)}</div>
                        <Button className="primary-button mt-4 h-11 justify-center text-sm" onClick={() => navigate("payment")}>مشاهده فاکتور و پرداخت {formatPrice(LABOR + PARTS)}</Button>
                      </div>
                    )}
                    {active && current === "rating" && (
                      <Button className="primary-button mt-3 h-11 text-sm" onClick={() => navigate("rating")}>ثبت امتیاز و نظر</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card">
            <div className="mb-4 font-black">{accepted ? "نصاب شما" : "نصاب انتخاب‌شده"}</div>
            <div className="flex items-center gap-3">
              <span className="avatar avatar-1 shrink-0"><Icon name="user" /></span>
              <div className="flex-1">
                <div className="font-black">{tech.name}</div>
                <div className="mt-0.5 text-xs text-muted">{tech.skill}</div>
                <div className="mt-1.5 rating w-fit"><Icon name="star" size="sm" />{formatDecimal(tech.rating)}</div>
              </div>
            </div>
            <Button className="secondary-button mt-4 w-full justify-center" onClick={() => navigate("technician-detail", tech.id)}>مشاهده پروفایل</Button>
            <Button className="primary-button mt-2 w-full justify-center" disabled={!accepted} onClick={() => setCallOpen(true)}><Icon name="phone" />تماس با نصاب</Button>
            <div className="mt-2 text-center text-xs text-muted">{accepted ? "شماره شما برای نصاب نمایش داده نمی‌شود" : "پس از پذیرش درخواست فعال می‌شود"}</div>
          </div>

          <div className="surface-card text-sm">
            <div className="mb-3 font-black">جزئیات درخواست</div>
            <div className="space-y-2 text-muted">
              <div>تعمیر · پمپ آب جتی پنتاکس</div>
              <div>سعادت‌آباد، خیابان دانشجو، پلاک ۱۲</div>
              <div>امروز، ساعت ۱۷ تا ۲۰</div>
            </div>
          </div>

          {stage < 4 && (
            <Button className="w-full rounded-2xl border border-red-200 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50" onClick={() => setCancelOpen(true)}>
              لغو درخواست
            </Button>
          )}
          <Button className="w-full py-2 text-xs font-bold text-muted hover:text-ink" onClick={() => navigate("support")}>گزارش مشکل به پشتیبانی</Button>
        </div>
      </div>

      <ConfirmDialog open={cancelOpen} onClose={() => setCancelOpen(false)} title="لغو درخواست" text={stage >= 3 ? "نصاب در مسیر است؛ ممکن است هزینه ایاب‌وذهاب (۱۵۰٬۰۰۰ تومان) دریافت شود." : "لغو پیش از حرکت نصاب رایگان است."}
        confirmLabel="تأیید لغو درخواست" danger reasons={["تغییر برنامه", "مشکل خودش حل شد", "قیمت مناسب نبود", "نصاب دیگری پیدا کردم"]}
        onConfirm={() => { toast("درخواست لغو شد"); navigate("my-requests"); }} />
      <ConfirmDialog open={quoteRejectOpen} onClose={() => setQuoteRejectOpen(false)} title="رد پیشنهاد قیمت" text="دلیل را برای نصاب بفرستید تا بتواند پیشنهاد جدیدی بدهد."
        confirmLabel="رد پیشنهاد" danger reasons={["قیمت بالاتر از انتظار است", "قطعات را خودم تهیه می‌کنم", "توضیح بیشتری درباره قطعات می‌خواهم"]}
        onConfirm={() => setQuoteRejected(true)} />
      <Modal open={callOpen} onClose={() => setCallOpen(false)} title={`تماس با ${tech.name}`} subtitle="تماس از طریق شماره واسط حنیفی برقرار می‌شود.">
        <div className="mt-5 rounded-2xl bg-canvas p-5 text-center">
          <div className="text-xs text-muted">شماره واسط</div>
          <div className="mt-2 text-2xl font-black tracking-wider" dir="ltr">۰۲۱ ۹۱۰۰ ۴۲۱۷</div>
          <div className="mt-1 text-xs text-muted">کد داخلی: ۳۸۲۵</div>
        </div>
        <a href="tel:02191004217" className="primary-button mt-5 justify-center"><Icon name="phone" />برقراری تماس</a>
        <div className="mt-3 text-center text-xs leading-6 text-muted">این شماره فقط تا پایان این درخواست فعال است و شماره واقعی هیچ‌یک از طرفین نمایش داده نمی‌شود.</div>
      </Modal>
    </main>
  );
}

// ─────────────────────────────────────────────
// TECHNICIAN DETAIL SCREEN
// ─────────────────────────────────────────────

export function TechnicianDetailScreen() {
  const { param, back, startService } = useApp();
  const tech = extendedTechnicians.find((t) => t.id === param) ?? extendedTechnicians[0];
  const available = tech.status === "آنلاین";
  const total = tech.ratingBreakdown.reduce((a, b) => a + b, 0);

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <div className="mb-6 flex items-center gap-3">
        <Button className="icon-action" onClick={back} label="بازگشت">
          <Icon name="back" />
        </Button>
        <div className="text-xl font-black sm:text-2xl">پروفایل متخصص</div>
        <span className="mr-auto flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-sm"><span className={`size-2.5 rounded-full ${tech.status === "آنلاین" ? "bg-success" : tech.status === "مشغول" ? "bg-red-500" : "bg-faint"}`} />{tech.status}</span>
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
                  <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
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
                { v: formatDecimal(tech.rating), l: "امتیاز" },
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
                      {formatNumber(star)}
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
                      {formatNumber(r.rating)}
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
            disabled={!available}
            onClick={() => startService({ technicianId: tech.id })}
          >
            <Icon name="tool" />
            درخواست از این نصاب
          </Button>
          {!available && <div className="text-center text-xs text-muted">این نصاب در حال حاضر {tech.status} است؛ درخواست شما به نصاب‌های آنلاین دیگر ارسال می‌شود.</div>}
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// PAYMENT SCREEN
// ─────────────────────────────────────────────

export function PaymentScreen() {
  const { navigate, startPayment } = useApp();
  const laborPrice = 650000;
  const partsPrice = 320000;
  const total = laborPrice + partsPrice;

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <div className="mb-6 flex items-center gap-3">
        <Button className="icon-action" onClick={() => navigate("request-status")} label="بازگشت">
          <Icon name="back" />
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
              قطعات از انبار گروه حنیفی با ضمانت اصالت تأمین شده است. سهم کمیسیون حنیفی از دستمزد کسر می‌شود و هزینه‌ای به شما اضافه نمی‌کند.
            </div>
            <div className="flex items-center justify-between border-t border-line pt-3 text-base font-black">
              <span>مبلغ قابل پرداخت</span>
              <span className="text-brand">{formatPrice(total)}</span>
            </div>
          </div>

          <Button
            className="primary-button mt-6 w-full justify-center"
            onClick={() => startPayment({ kind: "service", amount: total, requestId: 9001 })}
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
            {formatDecimal(extendedTechnicians[0].rating)}
          </div>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// MOCK BANK GATEWAY
// ─────────────────────────────────────────────

export function PaymentGatewayScreen() {
  const { navigate, back, payment, updateOrder } = useApp();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [processing, setProcessing] = useState(false);
  const digits = (value: string) => value.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/\D/g, "");
  const card = digits(cardNumber);
  const ready = card.length === 16 && digits(cvv).length >= 3 && digits(expiry).length === 4 && digits(otp).length >= 5;

  const finish = (ok: boolean) => {
    if (payment.kind === "order") {
      if (ok) updateOrder(payment.orderId, { status: "processing", paymentRef: `۶۲${formatId(payment.orderId)}۴۱۹۰۳` });
      navigate(ok ? "checkout-success" : "checkout-failure", payment.orderId);
    } else navigate(ok ? "payment-success" : "payment-failure");
  };

  const handlePay = () => {
    setProcessing(true);
    window.setTimeout(() => finish(true), 1800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a2f5a] p-4" dir="rtl">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#1a2f5a] text-white">
            <Icon name="shield" />
          </div>
          <div className="font-black text-[#1a2f5a]">درگاه پرداخت اینترنتی (نمونه)</div>
          <div className="mt-1 text-xs text-muted">شبکه الکترونیکی پرداخت کارت — شاپرک</div>
        </div>

        <div className="mb-5 rounded-2xl bg-canvas p-4 text-center">
          <div className="text-xs text-muted">مبلغ قابل پرداخت</div>
          <div className="mt-1 text-2xl font-black">{formatPrice(payment.amount)}</div>
          <div className="mt-1 text-xs text-muted">پذیرنده: گروه فنی صنعتی حنیفی · {payment.kind === "order" ? `سفارش ${formatId(payment.orderId)}` : `خدمت ${formatId(payment.requestId)}`}</div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-muted">
            شماره کارت
            <input
              className="form-field mt-1 text-center font-mono tracking-widest"
              dir="ltr"
              inputMode="numeric"
              placeholder="۶۰۳۷ ۹۹۰۰ ۰۰۰۰ ۰۰۰۰"
              value={card.replace(/(\d{4})(?=\d)/g, "$1 ")}
              onChange={(e) => setCardNumber(digits(e.target.value).slice(0, 16))}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-bold text-muted">
              CVV2
              <input className="form-field mt-1 text-center font-mono" dir="ltr" inputMode="numeric" maxLength={4} value={cvv} onChange={(e) => setCvv(digits(e.target.value))} />
            </label>
            <label className="block text-xs font-bold text-muted">
              تاریخ انقضا (ماه/سال)
              <input className="form-field mt-1 text-center" dir="ltr" inputMode="numeric" placeholder="۰۸/۰۷" value={expiry} onChange={(e) => setExpiry(e.target.value.slice(0, 5))} />
            </label>
          </div>
          <label className="block text-xs font-bold text-muted">
            رمز دوم پویا
            <div className="mt-1 flex gap-2">
              <input className="form-field mt-0 flex-1 text-center font-mono" dir="ltr" inputMode="numeric" maxLength={8} value={otp} onChange={(e) => setOtp(digits(e.target.value))} />
              <Button className="shrink-0 rounded-2xl bg-[#1a2f5a] px-3 text-xs font-bold text-white" disabled={card.length !== 16 || otpSent} onClick={() => setOtpSent(true)}>{otpSent ? "ارسال شد" : "دریافت رمز"}</Button>
            </div>
          </label>
        </div>

        <Button className="primary-button mt-5 w-full justify-center" disabled={processing || !ready} onClick={handlePay}>
          {processing ? "در حال پرداخت..." : "پرداخت"}
        </Button>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button className="rounded-xl border border-line py-2 text-xs font-bold text-muted" onClick={back}>انصراف</Button>
          <Button className="rounded-xl border border-line py-2 text-xs font-bold text-muted hover:text-red-500" onClick={() => finish(false)}>شبیه‌سازی خطا</Button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
          <Icon name="lock" size="sm" />
          این صفحه نمونه است؛ اطلاعات کارت ارسال نمی‌شود
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PAYMENT SUCCESS
// ─────────────────────────────────────────────

export function PaymentSuccessScreen() {
  const { navigate, payment } = useApp();
  return (
    <main className="page-wrap flex min-h-screen items-center justify-center py-10">
      <div className="mx-auto max-w-sm text-center">
        <div className="mx-auto mb-5 flex size-24 items-center justify-center rounded-full bg-green-50 text-green-700">
          <Icon name="check" size="lg" />
        </div>
        <div className="text-2xl font-black">پرداخت موفق!</div>
        <div className="mt-3 text-sm leading-7 text-muted">
          مبلغ {formatPrice(payment.amount)} با موفقیت پرداخت شد.
          <br />
          شماره پیگیری: ۱۴۰۵۰۷۰۵۲۸۷۴۳
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

export function PaymentFailureScreen() {
  const { navigate } = useApp();
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
            onClick={() => navigate("payment")}
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

export function RatingScreen() {
  const { navigate } = useApp();
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
            onClick={() => navigate("my-requests")}
          >
            درخواست‌های من
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <div className="mb-6 flex items-center gap-3">
        <Button className="icon-action" onClick={() => navigate("my-requests")} label="بازگشت">
          <Icon name="back" />
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
            <div className="mr-auto text-xs text-muted">تعمیر پمپ آب · ۵ مهر</div>
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

const statusLabel: Record<string, string> = requestStatusLabel;

const statusColor: Record<string, string> = {
  waiting: "bg-canvas text-ink",
  accepted: "bg-canvas text-ink",
  quote: "bg-amber-50 text-amber-700",
  enroute: "bg-sky-50 text-sky-700",
  done: "bg-green-50 text-green-700",
  paid: "bg-green-50 text-green-700",
  rated: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
};

export function MyRequestsScreen() {
  const { navigate } = useApp();
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
          <Icon name="back" />
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
                    <div className="mt-1 text-xs text-muted">شماره {formatId(req.id)}</div>
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
                      {formatDecimal(tech.rating)}
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
