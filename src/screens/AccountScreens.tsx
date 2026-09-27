import { useEffect, useRef, useState } from "react";
import AddressForm from "../components/AddressForm";
import Icon from "../components/Icon";
import { Button, ConfirmDialog, EmptyState, formatNumber, PageHeader, Toggle, toLatinDigits, toPersianDigits } from "../components/ui";
import type { Address } from "../data/mock";
import { useApp, type User } from "../state";

// ─────────────────────────────────────────────
// Login: phone → OTP → (first time) name
// ─────────────────────────────────────────────

const DEMO_CODE = "12345";
const KNOWN_USER = { phone: "09121234567", name: "سارا محمدی" };

export function LoginFlow({ onDone, compact = false }: { onDone: (user: User) => void; compact?: boolean }) {
  const [step, setStep] = useState<"phone" | "otp" | "name">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [name, setName] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const latinPhone = toLatinDigits(phone).replace(/\D/g, "");
  const phoneValid = /^09\d{9}$/.test(latinPhone);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  const sendCode = () => { setStep("otp"); setSeconds(60); setCode(["", "", "", "", ""]); setError(""); window.setTimeout(() => inputs.current[0]?.focus(), 50); };

  const verify = (digits: string[]) => {
    if (digits.join("") !== DEMO_CODE) { setError("کد وارد شده صحیح نیست"); return; }
    if (latinPhone === KNOWN_USER.phone) onDone({ phone: toPersianDigits(latinPhone), name: KNOWN_USER.name });
    else setStep("name");
  };

  const typeDigit = (index: number, raw: string) => {
    const digit = toLatinDigits(raw).replace(/\D/g, "").slice(-1);
    const next = code.map((value, i) => (i === index ? digit : value));
    setCode(next);
    setError("");
    if (digit && index < 4) inputs.current[index + 1]?.focus();
    if (next.every(Boolean)) verify(next);
  };

  return (
    <div className={compact ? "" : "surface-card mx-auto max-w-md p-6 sm:p-8"}>
      {!compact && <span className="brand-mark mx-auto"><Icon name="pump" size="lg" /></span>}
      {step === "phone" && (
        <>
          <div className={`${compact ? "mt-5" : "mt-5 text-center"} text-xl font-black`}>ورود یا ثبت‌نام</div>
          <div className={`mt-2 text-sm text-muted ${compact ? "" : "text-center"}`}>شماره موبایل خود را وارد کنید تا کد تأیید برایتان پیامک شود.</div>
          <label className="form-label">شماره موبایل
            <input className="form-field text-left text-lg tracking-widest" dir="ltr" inputMode="tel" autoFocus placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰" value={phone} onChange={(event) => setPhone(event.target.value)} onKeyDown={(event) => event.key === "Enter" && phoneValid && sendCode()} />
          </label>
          {phone && !phoneValid && <div className="mt-2 text-xs font-bold text-red-600">شماره باید ۱۱ رقم و با ۰۹ شروع شود</div>}
          <Button className="primary-button mt-6 w-full justify-center" disabled={!phoneValid} onClick={sendCode}>دریافت کد تأیید</Button>
          <div className="mt-4 text-center text-xs leading-6 text-muted">ورود شما به معنای پذیرش قوانین و حریم خصوصی حنیفی است.</div>
        </>
      )}
      {step === "otp" && (
        <>
          <div className={`${compact ? "mt-5" : "mt-5 text-center"} text-xl font-black`}>کد تأیید را وارد کنید</div>
          <div className={`mt-2 text-sm text-muted ${compact ? "" : "text-center"}`}>کد ۵ رقمی به شماره <b dir="ltr">{toPersianDigits(latinPhone)}</b> ارسال شد.</div>
          <div className="mt-6 flex justify-center gap-2" dir="ltr">
            {code.map((value, index) => (
              <input key={index} ref={(el) => { inputs.current[index] = el; }} className={`otp-box ${error ? "border-red-400 bg-red-50" : ""}`} inputMode="numeric" maxLength={1} value={toPersianDigits(value)} aria-label={`رقم ${formatNumber(index + 1)}`}
                onChange={(event) => typeDigit(index, event.target.value)}
                onKeyDown={(event) => event.key === "Backspace" && !code[index] && index > 0 && inputs.current[index - 1]?.focus()} />
            ))}
          </div>
          {error && <div className="mt-3 text-center text-xs font-bold text-red-600">{error}</div>}
          <div className="mt-3 text-center text-xs text-faint">کد نمونه برای این پیش‌نمایش: ۱۲۳۴۵</div>
          <div className="mt-5 flex items-center justify-between text-sm">
            <Button className="font-bold text-brand" onClick={() => setStep("phone")}>ویرایش شماره</Button>
            {seconds > 0 ? <span className="text-muted">ارسال مجدد تا {formatNumber(seconds)} ثانیه</span> : <Button className="font-bold text-brand" onClick={sendCode}>ارسال مجدد کد</Button>}
          </div>
        </>
      )}
      {step === "name" && (
        <>
          <div className={`${compact ? "mt-5" : "mt-5 text-center"} text-xl font-black`}>به حنیفی خوش آمدید</div>
          <div className={`mt-2 text-sm text-muted ${compact ? "" : "text-center"}`}>برای تکمیل ثبت‌نام، نام خود را وارد کنید.</div>
          <label className="form-label">نام و نام خانوادگی<input className="form-field" autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="مثال: رضا احمدی" /></label>
          <Button className="primary-button mt-6 w-full justify-center" disabled={name.trim().length < 3} onClick={() => onDone({ name: name.trim(), phone: toPersianDigits(latinPhone) })}>ثبت‌نام و ادامه</Button>
        </>
      )}
    </div>
  );
}

/** Shown by the router in place of any screen that needs an account; stays on that screen after login. */
export function LoginScreen({ stay = false }: { stay?: boolean }) {
  const { login, back } = useApp();
  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <PageHeader title="ورود به حساب" subtitle="برای ادامه وارد شوید" back={back} />
      <LoginFlow onDone={(user) => login(user, stay)} />
    </main>
  );
}

// ─────────────────────────────────────────────
// Account
// ─────────────────────────────────────────────

export function ProfileScreen() {
  const { user, navigate, back, logout, orders, addresses, login, switchRole } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [confirmOut, setConfirmOut] = useState(false);

  if (!user) return null;

  const activeOrders = orders.filter((order) => ["pending-payment", "processing", "shipped"].includes(order.status)).length;
  const rows: { icon: "orders" | "tool" | "pin" | "bell" | "support" | "file"; label: string; hint?: string; go: () => void }[] = [
    { icon: "orders", label: "سفارش‌های من", hint: activeOrders ? `${formatNumber(activeOrders)} سفارش جاری` : undefined, go: () => navigate("orders") },
    { icon: "tool", label: "درخواست‌های خدمت من", go: () => navigate("my-requests") },
    { icon: "pin", label: "آدرس‌های من", hint: `${formatNumber(addresses.length)} آدرس`, go: () => navigate("addresses") },
    { icon: "bell", label: "تنظیمات اعلان‌ها", go: () => navigate("notification-settings") },
    { icon: "support", label: "پشتیبانی و تماس با ما", go: () => navigate("support") },
    { icon: "file", label: "قوانین و حریم خصوصی", go: () => navigate("info", 2) },
  ];

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <PageHeader title="حساب من" back={back} />
      <div className="grid gap-5 md:grid-cols-3">
        <div className="surface-card h-fit text-center">
          <span className="avatar avatar-1 mx-auto size-16"><Icon name="user" size="lg" /></span>
          {editing ? (
            <div className="mt-3 flex gap-2"><input className="form-field mt-0 flex-1" value={name} onChange={(event) => setName(event.target.value)} autoFocus /><Button className="secondary-button h-auto px-3" disabled={name.trim().length < 3} onClick={() => { login({ ...user, name: name.trim() }, true); setEditing(false); }}>ذخیره</Button></div>
          ) : (
            <><div className="mt-3 font-black">{user.name}</div><div className="mt-1 text-xs text-muted" dir="ltr">{user.phone}</div><Button className="mt-3 text-xs font-bold text-brand" onClick={() => setEditing(true)}><span className="flex items-center gap-1"><Icon name="edit" size="sm" />ویرایش نام</span></Button></>
          )}
        </div>
        <div className="surface-card space-y-1 md:col-span-2">
          {rows.map((row) => (
            <Button key={row.label} className="menu-row w-full" onClick={row.go}>
              <span className="flex items-center gap-3"><span className="text-brand"><Icon name={row.icon} /></span>{row.label}</span>
              <span className="mr-auto text-xs text-muted">{row.hint}</span><Icon name="arrow" size="sm" />
            </Button>
          ))}
          <Button className="menu-row w-full text-red-600" onClick={() => setConfirmOut(true)}><span className="flex items-center gap-3"><Icon name="logout" />خروج از حساب</span></Button>
        </div>
      </div>
      <div className="cross-sell mt-5">
        <span className="category-icon bg-white/15 text-white"><Icon name="tool" /></span>
        <div className="flex-1"><div className="font-black">نصاب هستید؟</div><div className="mt-1 text-sm text-white/70">در شبکه حنیفی ثبت‌نام کنید و درخواست‌های محدوده خود را دریافت کنید.</div></div>
        <Button className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-brand" onClick={() => switchRole("technician", "onboarding")}>ثبت‌نام نصاب</Button>
      </div>
      <ConfirmDialog open={confirmOut} onClose={() => setConfirmOut(false)} title="خروج از حساب" text="مطمئن هستید؟ سبد خرید شما حفظ می‌شود." confirmLabel="خروج" danger onConfirm={logout} />
    </main>
  );
}

export function AddressesScreen() {
  const { addresses, removeAddress, back } = useApp();
  const [editing, setEditing] = useState<Address | "new" | null>(null);
  const [removing, setRemoving] = useState<Address | null>(null);
  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <PageHeader title="آدرس‌های من" subtitle="برای خرید و درخواست خدمت" back={back} action={<Button className="primary-button h-11" onClick={() => setEditing("new")}><Icon name="plus" size="sm" />آدرس جدید</Button>} />
      <div className="grid gap-3 md:grid-cols-2">
        {addresses.map((address) => (
          <div key={address.id} className="surface-card">
            <div className="flex items-center gap-3"><span className="category-icon"><Icon name={address.icon} /></span><div className="font-black">{address.label}</div></div>
            <div className="mt-3 text-sm leading-7 text-muted">{address.detail}</div>
            <div className="mt-1 text-xs text-faint">{address.receiver} · {address.phone} · کد پستی {address.postalCode || "—"}</div>
            <div className="mt-4 flex gap-4 border-t border-line pt-3 text-sm font-bold">
              <Button className="flex items-center gap-1 text-brand" onClick={() => setEditing(address)}><Icon name="edit" size="sm" />ویرایش</Button>
              <Button className="flex items-center gap-1 text-red-600" onClick={() => setRemoving(address)}><Icon name="trash" size="sm" />حذف</Button>
            </div>
          </div>
        ))}
      </div>
      {!addresses.length && <EmptyState icon="pin" text="هنوز آدرسی ثبت نکرده‌اید" action="افزودن آدرس" onClick={() => setEditing("new")} />}
      {editing && <AddressForm key={editing === "new" ? "new" : editing.id} open onClose={() => setEditing(null)} address={editing === "new" ? undefined : editing} />}
      <ConfirmDialog open={Boolean(removing)} onClose={() => setRemoving(null)} title="حذف آدرس" text={`آدرس «${removing?.label ?? ""}» حذف شود؟`} confirmLabel="حذف" danger onConfirm={() => removing && removeAddress(removing.id)} />
    </main>
  );
}

export function NotificationSettingsScreen() {
  const { back, toast } = useApp();
  const [settings, setSettings] = useState({
    orders: { push: true, sms: true }, requests: { push: true, sms: true }, technicianNear: { push: true, sms: false },
    payments: { push: true, sms: true }, offers: { push: false, sms: false }, admin: { push: true, sms: false },
  });
  const labels: Record<keyof typeof settings, [string, string]> = {
    orders: ["وضعیت سفارش‌ها", "ثبت، ارسال و تحویل سفارش"],
    requests: ["درخواست‌های خدمت", "پذیرش، رد و پیشنهاد قیمت نصاب"],
    technicianNear: ["نزدیک شدن نصاب", "وقتی نصاب در مسیر محل شماست"],
    payments: ["پرداخت‌ها", "رسید پرداخت و بازگشت وجه"],
    offers: ["تخفیف‌ها و پیشنهادها", "کدهای تخفیف و فروش ویژه"],
    admin: ["پیام‌های مدیریت", "اطلاعیه‌های مهم حنیفی"],
  };
  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <PageHeader title="تنظیمات اعلان‌ها" subtitle="انتخاب کنید چه چیزی و از چه راهی به شما اطلاع دهیم" back={back} />
      <div className="surface-card">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 gap-y-1 text-sm">
          <div /><div className="text-center text-xs font-bold text-muted">اعلان اپ</div><div className="text-center text-xs font-bold text-muted">پیامک</div>
          {(Object.keys(labels) as (keyof typeof settings)[]).map((key) => (
            <div key={key} className="contents">
              <div className="border-t border-line py-4"><div className="font-bold">{labels[key][0]}</div><div className="mt-1 text-xs text-muted">{labels[key][1]}</div></div>
              {(["push", "sms"] as const).map((channel) => (
                <div key={channel} className="flex justify-center border-t border-line py-4">
                  <Toggle checked={settings[key][channel]} label={`${labels[key][0]} — ${channel === "push" ? "اعلان" : "پیامک"}`} onChange={(value) => setSettings({ ...settings, [key]: { ...settings[key], [channel]: value } })} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <Button className="primary-button mt-5" onClick={() => { toast("تنظیمات ذخیره شد"); back(); }}>ذخیره تنظیمات</Button>
    </main>
  );
}

export function SupportScreen() {
  const { back, toast } = useApp();
  const [open, setOpen] = useState<number | null>(0);
  const [subject, setSubject] = useState("سفارش");
  const [message, setMessage] = useState("");
  const faqs = [
    ["سفارشم کی می‌رسد؟", "سفارش‌های تهران با پیک همان روز و با پست پیشتاز ۳ تا ۵ روز کاری می‌رسند. کد رهگیری در صفحه سفارش نمایش داده می‌شود."],
    ["اگر نصاب نیامد چه کنم؟", "اگر نصاب تا ۳۰ دقیقه بعد از زمان توافق‌شده نرسید، از صفحه درخواست گزینه «گزارش مشکل» را بزنید تا پشتیبانی نصاب دیگری اعزام کند. هیچ مبلغی پیش از پایان کار پرداخت نمی‌شود."],
    ["هزینه خدمات چطور تعیین می‌شود؟", "هر نصاب تعرفه پایه خود را در پروفایل اعلام می‌کند. پس از بازدید، پیشنهاد قیمت نهایی (دستمزد + قطعات) را در اپ می‌فرستد و تا شما تأیید نکنید کاری شروع نمی‌شود."],
    ["شماره من برای نصاب نمایش داده می‌شود؟", "خیر. تماس‌ها از طریق شماره واسط برقرار می‌شود و آدرس دقیق شما فقط پس از پذیرش درخواست برای نصاب نمایش داده می‌شود."],
    ["چطور کالا را مرجوع کنم؟", "تا ۷ روز پس از تحویل، در صورت سالم بودن بسته‌بندی، از صفحه سفارش درخواست مرجوعی ثبت کنید."],
  ];
  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <PageHeader title="پشتیبانی" subtitle="شنبه تا پنجشنبه، ۸ تا ۱۸" back={back} />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-3">
          <a href="tel:02144228100" className="info-card hover:border-brand/30"><span className="stat-icon"><Icon name="phone" /></span><span><span className="block">تماس تلفنی</span><span className="mt-1 block text-xs font-normal text-muted">۰۲۱–۴۴۲۲۸۱۰۰</span></span></a>
          <div className="info-card"><span className="stat-icon"><Icon name="pin" /></span><span><span className="block">دفتر مرکزی</span><span className="mt-1 block text-xs font-normal text-muted">تهران، خیابان آزادی، مجتمع صنعتی حنیفی</span></span></div>
        </div>
        <div className="surface-card lg:col-span-2">
          <div className="mb-3 font-black">سؤالات متداول</div>
          {faqs.map(([q, a], i) => (
            <div key={q} className="border-b border-line last:border-0">
              <Button className="flex w-full items-center justify-between gap-3 py-4 text-right text-sm font-bold" onClick={() => setOpen(open === i ? null : i)}>{q}<span className={`transition-transform ${open === i ? "rotate-90" : "-rotate-90"}`}><Icon name="arrow" size="sm" /></span></Button>
              {open === i && <div className="pb-4 text-sm leading-7 text-muted">{a}</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="surface-card mt-5">
        <div className="font-black">ارسال تیکت</div>
        <div className="mt-4 flex flex-wrap gap-2">{["سفارش", "درخواست خدمت", "پرداخت", "حساب کاربری", "سایر"].map((item) => <Button key={item} className={`filter-chip ${subject === item ? "filter-chip-active" : ""}`} onClick={() => setSubject(item)}>{item}</Button>)}</div>
        <textarea className="form-field min-h-28 resize-none" placeholder="مشکل یا سؤال خود را بنویسید..." value={message} onChange={(event) => setMessage(event.target.value)} />
        <Button className="primary-button mt-4" disabled={message.trim().length < 10} onClick={() => { setMessage(""); toast("تیکت ثبت شد؛ پاسخ از طریق پیامک اطلاع داده می‌شود"); }}><Icon name="send" size="sm" />ارسال</Button>
      </div>
    </main>
  );
}

const infoPages: Record<number, { title: string; body: string[] }> = {
  1: { title: "درباره حنیفی", body: ["گروه فنی صنعتی حنیفی بیش از دو دهه در زمینه فروش و خدمات پمپ آب، الکتروموتور و گیربکس فعالیت دارد.", "این اپ دو خدمت را کنار هم ارائه می‌کند: فروش مستقیم تجهیزات اصل با ضمانت حنیفی، و شبکه نصاب‌های احراز هویت‌شده برای نصب، تعمیر، عیب‌یابی و سرویس دوره‌ای."] },
  2: { title: "قوانین و مقررات", body: ["ثبت سفارش و درخواست خدمت به معنای پذیرش این قوانین است.", "هزینه خدمات تنها پس از تأیید پیشنهاد قیمت توسط مشتری قطعی می‌شود. لغو درخواست پیش از حرکت نصاب رایگان است.", "کالاها تا ۷ روز پس از تحویل و با بسته‌بندی سالم قابل مرجوع هستند."] },
  3: { title: "حریم خصوصی", body: ["شماره تماس مشتری و نصاب هرگز به طرف مقابل نمایش داده نمی‌شود و تماس‌ها از طریق شماره واسط برقرار می‌شود.", "آدرس دقیق مشتری فقط پس از پذیرش درخواست برای نصاب نمایش داده می‌شود و موقعیت نصاب‌ها روی نقشه به صورت محدوده تقریبی نشان داده می‌شود.", "مدارک هویتی نصاب‌ها فقط برای احراز هویت استفاده و به صورت رمزنگاری‌شده نگهداری می‌شود."] },
};

export function InfoScreen() {
  const { param, back } = useApp();
  const page = infoPages[param] ?? infoPages[1];
  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <PageHeader title={page.title} back={back} />
      <div className="surface-card max-w-3xl space-y-4 text-sm leading-8 text-muted">{page.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
    </main>
  );
}

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────

export function NotificationsScreen() {
  const { notifications, markRead, markAllRead, navigate, back } = useApp();
  const unread = notifications.filter((item) => item.unread).length;
  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <PageHeader title="اعلان‌ها" subtitle={unread ? `${formatNumber(unread)} اعلان خوانده‌نشده` : "همه اعلان‌ها خوانده شده‌اند"} back={back}
        action={unread > 0 && <Button className="text-xs font-bold text-brand" onClick={markAllRead}>خواندن همه</Button>} />
      <div className="space-y-3">
        {notifications.map((item) => (
          <Button key={item.id} className={`notification-row w-full text-right ${item.unread ? "notification-unread" : ""}`} onClick={() => { markRead(item.id); navigate(item.target); }}>
            <span className="stat-icon shrink-0"><Icon name={item.icon} /></span>
            <span className="min-w-0 flex-1"><span className="flex items-center gap-2 font-black">{item.title}{item.unread && <span className="size-2 rounded-full bg-accent" />}</span><span className="mt-1 block text-sm text-muted">{item.text}</span><span className="mt-2 block text-xs text-faint">{item.time}</span></span>
          </Button>
        ))}
      </div>
      <Button className="text-link mt-5" onClick={() => navigate("notification-settings")}><Icon name="settings" size="sm" />تنظیمات اعلان‌ها</Button>
    </main>
  );
}
