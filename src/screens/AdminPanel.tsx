import { useState } from "react";
import { ColumnChart, DataTable, downloadCsv, Kpi, Pill, type Column } from "../components/AdminKit";
import Icon, { type IconName } from "../components/Icon";
import { MapBg } from "../components/MapPicker";
import { Button, ConfirmDialog, formatDecimal, formatNumber, formatPrice, Modal, Toggle, formatId } from "../components/ui";
import {
  adminCustomers, adminDiscounts, adminOrders, adminRequests, adminRoles, adminTechnicians, adminUsers, brands, categories,
  commissionSettings, coverageRegions, extendedTechnicians, moderationReviews, monthlyReport, orderStatusLabel, pendingSettlements,
  pendingTechnicians, products, requestStatusLabel, sentNotifications, transactions, weeklySales,
  type AccountStatus, type DocStatus, type OrderStatus, type PendingTechnician, type Product, type ServiceRequestStatus,
} from "../data/mock";
import { isValidNationalCode } from "../lib/validation";
import { useApp } from "../state";

type Section =
  | "dashboard" | "kyc" | "technicians" | "customers" | "products" | "orders" | "requests" | "commission"
  | "transactions" | "discounts" | "reviews" | "reports" | "notifications" | "coverage" | "admins";

const sections: { key: Section; label: string; icon: IconName; group: string }[] = [
  { key: "dashboard", label: "داشبورد", icon: "chart", group: "" },
  { key: "kyc", label: "احراز هویت نصاب‌ها", icon: "shield", group: "کاربران" },
  { key: "technicians", label: "نصاب‌ها", icon: "tool", group: "کاربران" },
  { key: "customers", label: "کاربران", icon: "users", group: "کاربران" },
  { key: "products", label: "محصولات", icon: "box", group: "فروشگاه" },
  { key: "orders", label: "سفارش‌ها", icon: "bag", group: "فروشگاه" },
  { key: "discounts", label: "کدهای تخفیف", icon: "percent", group: "فروشگاه" },
  { key: "requests", label: "درخواست‌های خدمت", icon: "orders", group: "خدمات" },
  { key: "coverage", label: "مناطق پوشش", icon: "map", group: "خدمات" },
  { key: "reviews", label: "نظرات", icon: "star", group: "خدمات" },
  { key: "commission", label: "کمیسیون و تسویه", icon: "wallet", group: "مالی" },
  { key: "transactions", label: "تراکنش‌ها", icon: "file", group: "مالی" },
  { key: "reports", label: "گزارشات", icon: "chart", group: "مالی" },
  { key: "notifications", label: "اعلان‌ها", icon: "bell", group: "سیستم" },
  { key: "admins", label: "مدیران و دسترسی‌ها", icon: "lock", group: "سیستم" },
];

const orderTone: Record<OrderStatus, "amber" | "blue" | "violet" | "green" | "red"> = { "pending-payment": "amber", processing: "blue", shipped: "violet", delivered: "green", cancelled: "red" };
const requestTone = (status: ServiceRequestStatus) => (status === "cancelled" ? "red" : status === "waiting" || status === "quote" ? "amber" : status === "rated" || status === "paid" ? "green" : "blue");
const accountTone: Record<AccountStatus, "green" | "amber" | "red" | "gray"> = { فعال: "green", "در انتظار": "amber", تعلیق: "amber", مسدود: "red" };

export default function AdminPanel() {
  const [section, setSection] = useState<Section>("dashboard");
  const [drawer, setDrawer] = useState(false);
  const [kycQueue, setKycQueue] = useState(pendingTechnicians);
  const current = sections.find((item) => item.key === section)!;
  const go = (next: Section) => { setSection(next); setDrawer(false); window.scrollTo({ top: 0 }); };

  const nav = (
    <nav className="space-y-4">
      {["", "کاربران", "فروشگاه", "خدمات", "مالی", "سیستم"].map((group) => (
        <div key={group || "main"}>
          {group && <div className="mb-1 px-3 text-[11px] font-black text-white/40">{group}</div>}
          {sections.filter((item) => item.group === group).map((item) => (
            <Button key={item.key} className={`admin-nav ${section === item.key ? "admin-nav-active" : ""}`} onClick={() => go(item.key)}>
              <Icon name={item.icon} size="sm" /><span className="flex-1 text-right">{item.label}</span>
              {item.key === "kyc" && kycQueue.length > 0 && <span className="rounded-full bg-accent px-1.5 text-[11px] font-black text-ink">{formatNumber(kycQueue.length)}</span>}
            </Button>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-canvas text-ink lg:flex">
      <aside className="admin-sidebar hidden lg:block">
        <div className="mb-6 flex items-center gap-3 px-2"><span className="brand-mark size-10"><Icon name="pump" /></span><div><div className="text-sm font-black text-white">پنل مدیریت حنیفی</div><div className="text-xs text-white/50">حمید حنیفی · مدیر کل</div></div></div>
        {nav}
      </aside>
      {drawer && (
        <div className="fixed inset-0 z-50 bg-ink/50 lg:hidden" onClick={() => setDrawer(false)}>
          <aside className="admin-sidebar h-full w-72 overflow-y-auto" onClick={(event) => event.stopPropagation()}>{nav}</aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur-xl lg:px-8">
          <Button className="icon-action lg:hidden" onClick={() => setDrawer(true)} label="منو"><Icon name="menu" /></Button>
          <div className="min-w-0 flex-1"><div className="truncate font-black">{current.label}</div></div>
          <span className="hidden text-xs text-muted sm:inline">یکشنبه ۵ مهر ۱۴۰۵</span>
        </header>
        <main className="px-4 pb-28 pt-6 lg:px-8">
          {section === "dashboard" && <Dashboard go={go} kycCount={kycQueue.length} />}
          {section === "kyc" && <KycQueue queue={kycQueue} setQueue={setKycQueue} />}
          {section === "technicians" && <Technicians />}
          {section === "customers" && <Customers />}
          {section === "products" && <Products />}
          {section === "orders" && <Orders />}
          {section === "requests" && <Requests />}
          {section === "commission" && <Commission />}
          {section === "transactions" && <Transactions />}
          {section === "discounts" && <Discounts />}
          {section === "reviews" && <Reviews />}
          {section === "reports" && <Reports />}
          {section === "notifications" && <Notifications />}
          {section === "coverage" && <Coverage />}
          {section === "admins" && <Admins />}
        </main>
      </div>
    </div>
  );
}

function Card({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`admin-card ${className}`}>
      {title && <div className="mb-4 flex items-center justify-between gap-3"><div className="font-black">{title}</div>{action}</div>}
      {children}
    </div>
  );
}

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-3 border-b border-line py-2.5 text-sm last:border-0"><span className="text-muted">{label}</span><span className="text-left font-bold">{value}</span></div>
);

// ─────────────────────────────────────────────
// 1. Dashboard
// ─────────────────────────────────────────────

function Dashboard({ go, kycCount }: { go: (s: Section) => void; kycCount: number }) {
  const todayOrders = adminOrders.filter((order) => order.date === "۵ مهر");
  const sales = todayOrders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.total, 0);
  const lowStock = products.filter((product) => product.stock <= 3);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <Kpi icon="bag" label="فروش امروز" value={formatNumber(Math.round(sales / 1_000_000))} hint={`میلیون تومان · ${formatNumber(todayOrders.length)} سفارش`} />
        <Kpi icon="tool" label="درخواست خدمت امروز" value={formatNumber(adminRequests.filter((r) => r.date === "۵ مهر").length)} hint={`${formatNumber(adminRequests.filter((r) => r.status === "waiting").length)} در انتظار پذیرش`} />
        <Kpi icon="wallet" label="درآمد شهریور" value={formatNumber(monthlyReport[5].sales)} hint="میلیون تومان · فروش مستقیم" />
        <Kpi icon="percent" label="کمیسیون شهریور" value={formatDecimal(monthlyReport[5].commission)} hint="میلیون تومان · از خدمات" />
        <Kpi icon="shield" label="در انتظار احراز هویت" value={formatNumber(kycCount)} hint="نصاب جدید" tone={kycCount ? "amber" : "brand"} />
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Card title="فروش ۷ روز اخیر (میلیون تومان)" className="xl:col-span-2"><ColumnChart data={weeklySales.map((d) => ({ label: d.day, value: d.value }))} unit="میلیون تومان" /></Card>
        <Card title="نیازمند بررسی">
          {([
            ["shield", "احراز هویت نصاب‌ها", kycCount, "kyc"],
            ["box", "محصولات کم‌موجودی", lowStock.length, "products"],
            ["star", "نظرات گزارش‌شده", moderationReviews.filter((r) => r.state === "گزارش‌شده").length, "reviews"],
            ["wallet", "تسویه‌های در انتظار", pendingSettlements.length, "commission"],
          ] as [IconName, string, number, Section][]).map(([icon, label, count, target]) => (
            <Button key={label} className="menu-row w-full" onClick={() => go(target)}>
              <span className="flex items-center gap-3"><span className="text-brand"><Icon name={icon} size="sm" /></span>{label}</span>
              <span className="mr-auto rounded-full bg-brand-soft px-2 py-0.5 text-xs font-black text-brand">{formatNumber(count)}</span><Icon name="arrow" size="sm" />
            </Button>
          ))}
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="آخرین سفارش‌ها" action={<Button className="text-link" onClick={() => go("orders")}>همه<Icon name="arrow" size="sm" /></Button>}>
          {adminOrders.slice(0, 5).map((order) => <div key={order.id} className="flex items-center gap-3 border-b border-line py-2.5 text-sm last:border-0"><span className="font-bold">#{formatId(order.id)}</span><span className="min-w-0 flex-1 truncate text-muted">{order.customer}</span><Pill tone={orderTone[order.status]}>{orderStatusLabel[order.status]}</Pill></div>)}
        </Card>
        <Card title="آخرین درخواست‌های خدمت" action={<Button className="text-link" onClick={() => go("requests")}>همه<Icon name="arrow" size="sm" /></Button>}>
          {adminRequests.slice(0, 5).map((request) => <div key={request.id} className="flex items-center gap-3 border-b border-line py-2.5 text-sm last:border-0"><span className="font-bold">#{formatId(request.id)}</span><span className="min-w-0 flex-1 truncate text-muted">{request.service} · {request.area}</span><Pill tone={requestTone(request.status)}>{requestStatusLabel[request.status]}</Pill></div>)}
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 2. KYC queue
// ─────────────────────────────────────────────

function KycQueue({ queue, setQueue }: { queue: PendingTechnician[]; setQueue: (q: PendingTechnician[]) => void }) {
  const { toast } = useApp();
  const [openId, setOpenId] = useState<number | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [fixOpen, setFixOpen] = useState(false);
  const [fixDocs, setFixDocs] = useState<string[]>([]);
  const [fixNote, setFixNote] = useState("");
  const tech = queue.find((item) => item.id === openId);

  const setDoc = (key: string, status: DocStatus) => tech && setQueue(queue.map((item) => (item.id === tech.id ? { ...item, docs: item.docs.map((doc) => (doc.key === key ? { ...doc, status } : doc)) } : item)));
  const close = (message: string) => { setQueue(queue.filter((item) => item.id !== openId)); setOpenId(null); toast(message); };

  if (tech) {
    const allOk = tech.docs.every((doc) => doc.status === "تأییدشده");
    return (
      <div className="space-y-5">
        <Button className="text-link" onClick={() => setOpenId(null)}><Icon name="back" size="sm" />بازگشت به صف</Button>
        <Card>
          <div className="flex flex-wrap items-center gap-4">
            <span className="avatar avatar-2 size-14"><Icon name="user" size="lg" /></span>
            <div className="flex-1"><div className="text-lg font-black">{tech.name}</div><div className="mt-1 text-xs text-muted">{tech.city} · {tech.phone} · ارسال: {tech.submitted}</div><div className="mt-2 flex flex-wrap gap-1">{tech.specialties.map((s) => <Pill key={s}>{s}</Pill>)}</div></div>
            <div className="grid gap-1 text-xs"><span>کد ملی: <b dir="ltr">{tech.nationalCode}</b> {isValidNationalCode(tech.nationalCode) ? <span className="text-success">✓ ساختار معتبر</span> : <span className="text-red-600">✗ نامعتبر</span>}</span><span>شبا: <b dir="ltr">{tech.sheba.slice(0, 8)}…</b> — {tech.bankHolder}</span><span className="text-success">✓ نام صاحب حساب با نام نصاب یکسان است</span></div>
          </div>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {tech.docs.map((doc) => (
            <Card key={doc.key}>
              <div className="doc-preview"><Icon name={doc.key === "bank" ? "wallet" : doc.key === "selfie" ? "camera" : "file"} size="lg" /><span>{doc.label}</span><span className="text-[10px]">پیش‌نمایش تصویر ارسالی</span></div>
              <div className="mt-3 flex items-center gap-2">
                <span className="flex-1 text-sm font-black">{doc.label}</span>
                <Pill tone={doc.status === "تأییدشده" ? "green" : doc.status === "ردشده" ? "red" : "amber"}>{doc.status}</Pill>
              </div>
              <div className="mt-3 flex gap-2">
                <Button className="flex-1 rounded-xl bg-green-50 py-2 text-xs font-black text-green-700" onClick={() => setDoc(doc.key, "تأییدشده")}>تأیید مدرک</Button>
                <Button className="flex-1 rounded-xl bg-red-50 py-2 text-xs font-black text-red-600" onClick={() => setDoc(doc.key, "ردشده")}>رد مدرک</Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="admin-card flex flex-wrap gap-2">
          <Button className="primary-button" disabled={!allOk} onClick={() => close(`${tech.name} تأیید و فعال شد`)}><Icon name="check" />تأیید و فعال‌سازی</Button>
          <Button className="secondary-button" onClick={() => { setFixDocs(tech.docs.filter((d) => d.status === "ردشده").map((d) => d.label)); setFixOpen(true); }}><Icon name="edit" />درخواست اصلاح مدرک</Button>
          <Button className="danger-button" onClick={() => setRejectOpen(true)}><Icon name="close" />رد درخواست</Button>
          {!allOk && <span className="self-center text-xs text-muted">برای فعال‌سازی، همه مدارک باید تأیید شوند.</span>}
        </div>
        <ConfirmDialog open={rejectOpen} onClose={() => setRejectOpen(false)} title={`رد درخواست ${tech.name}`} text="دلیل رد برای متقاضی پیامک می‌شود." confirmLabel="رد درخواست" danger
          reasons={["مدارک هویتی جعلی یا نامعتبر", "عدم تطابق چهره با کارت ملی", "نداشتن مدرک فنی معتبر", "خارج از مناطق پوشش"]} onConfirm={() => close("درخواست رد شد و به متقاضی اطلاع داده شد")} />
        <Modal open={fixOpen} onClose={() => setFixOpen(false)} title="درخواست اصلاح مدرک" subtitle="مدارکی که باید دوباره ارسال شوند را انتخاب کنید.">
          <div className="mt-4 space-y-2">{tech.docs.map((doc) => { const on = fixDocs.includes(doc.label); return <Button key={doc.key} className={`radio-row ${on ? "radio-row-active" : ""}`} onClick={() => setFixDocs(on ? fixDocs.filter((d) => d !== doc.label) : [...fixDocs, doc.label])}><span className={`checkbox ${on ? "checkbox-on" : ""}`}>{on && <Icon name="check" size="sm" />}</span>{doc.label}</Button>; })}</div>
          <textarea className="form-field min-h-20 resize-none" placeholder="توضیح برای نصاب، مثلاً: تصویر کارت ملی تار است" value={fixNote} onChange={(event) => setFixNote(event.target.value)} />
          <Button className="primary-button mt-5 w-full justify-center" disabled={!fixDocs.length} onClick={() => { setFixOpen(false); close("درخواست اصلاح برای نصاب ارسال شد"); }}>ارسال به نصاب</Button>
        </Modal>
      </div>
    );
  }

  return queue.length ? (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {queue.map((item) => (
        <Button key={item.id} className="admin-card block text-right hover:border-brand/30" onClick={() => setOpenId(item.id)}>
          <div className="flex items-center gap-3"><span className="avatar avatar-3"><Icon name="user" /></span><div className="min-w-0 flex-1"><div className="font-black">{item.name}</div><div className="text-xs text-muted">{item.city} · {item.submitted}</div></div></div>
          <div className="mt-3 flex flex-wrap gap-1">{item.docs.map((doc) => <Pill key={doc.key} tone={doc.status === "تأییدشده" ? "green" : doc.status === "ردشده" ? "red" : "amber"}>{doc.label}</Pill>)}</div>
          <div className="mt-3 flex items-center gap-1 text-sm font-bold text-brand">بررسی مدارک<Icon name="arrow" size="sm" /></div>
        </Button>
      ))}
    </div>
  ) : <Card><div className="py-10 text-center text-sm text-muted">صف احراز هویت خالی است.</div></Card>;
}

// ─────────────────────────────────────────────
// 3. Technicians
// ─────────────────────────────────────────────

function Technicians() {
  const { toast } = useApp();
  const [rows, setRows] = useState(adminTechnicians);
  const [open, setOpen] = useState<(typeof rows)[number] | null>(null);
  const [action, setAction] = useState<"تعلیق" | "مسدود" | "فعال" | null>(null);
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "name", label: "نصاب", render: (t) => <div><div className="font-bold">{t.name}</div><div className="text-xs text-muted">{t.skill}</div></div> },
    { key: "city", label: "شهر", render: (t) => t.city, hideOnMobile: true },
    { key: "online", label: "وضعیت آنلاین", render: (t) => <span className="flex items-center gap-1.5 text-xs font-bold"><span className={`size-2 rounded-full ${t.online === "آنلاین" ? "bg-success" : t.online === "مشغول" ? "bg-red-500" : "bg-faint"}`} />{t.online}</span>, hideOnMobile: true },
    { key: "rating", label: "امتیاز", render: (t) => `★ ${formatDecimal(t.rating)}` },
    { key: "jobs", label: "پروژه", render: (t) => formatNumber(t.jobs), hideOnMobile: true },
    { key: "acc", label: "پذیرش", render: (t) => `${formatNumber(t.acceptance)}٪`, hideOnMobile: true },
    { key: "account", label: "حساب", render: (t) => <Pill tone={accountTone[t.account]}>{t.account}</Pill> },
  ];
  const apply = (reason: string) => {
    if (!open || !action) return;
    const account: AccountStatus = action === "فعال" ? "فعال" : action;
    setRows(rows.map((row) => (row.id === open.id ? { ...row, account } : row)));
    setOpen({ ...open, account });
    toast(`${open.name}: ${action === "فعال" ? "فعال‌سازی مجدد" : action}${reason ? ` — ${reason}` : ""}`);
  };
  return (
    <>
      <DataTable rows={rows} columns={columns} searchText={(t) => `${t.name} ${t.skill} ${t.city}`} filters={["فعال", "در انتظار", "تعلیق", "مسدود"]} filterOf={(t) => t.account} onRow={setOpen} />
      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title={open?.name ?? ""} subtitle={open ? `${open.skill} · ${open.city}` : ""} wide>
        {open && (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["امتیاز", formatDecimal(open.rating)], ["پروژه", formatNumber(open.jobs)], ["نرخ پذیرش", `${formatNumber(open.acceptance)}٪`], ["درآمد کل", `${formatNumber(Math.round(open.earnings / 1_000_000))} م.ت`]].map(([l, v]) => <div key={l} className="rounded-2xl bg-canvas p-3 text-center"><div className="text-lg font-black">{v}</div><div className="text-xs text-muted">{l}</div></div>)}
            </div>
            <div className="mt-4 rounded-2xl border border-line p-4"><Row label="وضعیت حساب" value={<Pill tone={accountTone[open.account]}>{open.account}</Pill>} /><Row label="وضعیت آنلاین" value={open.online} /><Row label="مدارک" value="همه تأییدشده" /></div>
            <div className="mt-5 flex flex-wrap gap-2">
              {open.account !== "فعال" && <Button className="primary-button" onClick={() => setAction("فعال")}><Icon name="check" />فعال‌سازی مجدد</Button>}
              {open.account !== "تعلیق" && <Button className="secondary-button" onClick={() => setAction("تعلیق")}><Icon name="pause" />تعلیق</Button>}
              {open.account !== "مسدود" && <Button className="danger-button" onClick={() => setAction("مسدود")}><Icon name="ban" />مسدودسازی</Button>}
            </div>
          </>
        )}
      </Modal>
      <ConfirmDialog open={Boolean(action)} onClose={() => setAction(null)} danger={action !== "فعال"}
        title={action === "فعال" ? "فعال‌سازی مجدد نصاب" : action === "تعلیق" ? "تعلیق موقت نصاب" : "مسدودسازی دائم نصاب"}
        text={action === "فعال" ? "نصاب دوباره درخواست دریافت می‌کند." : "دلیل برای نصاب پیامک می‌شود و در سوابق ثبت می‌شود."}
        confirmLabel={action === "فعال" ? "فعال‌سازی" : action === "تعلیق" ? "تعلیق" : "مسدودسازی"}
        reasons={action === "فعال" ? undefined : ["تأخیرهای مکرر", "شکایت مشتری", "دریافت وجه خارج از اپ", "انقضای مدارک"]}
        onConfirm={apply} />
    </>
  );
}

// ─────────────────────────────────────────────
// 4. Customers
// ─────────────────────────────────────────────

function Customers() {
  const { toast } = useApp();
  const [rows, setRows] = useState(adminCustomers);
  const [open, setOpen] = useState<(typeof rows)[number] | null>(null);
  const [confirm, setConfirm] = useState(false);
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "name", label: "نام", render: (c) => <span className="font-bold">{c.name}</span> },
    { key: "phone", label: "موبایل", render: (c) => <span dir="ltr">{c.phone}</span>, hideOnMobile: true },
    { key: "city", label: "شهر", render: (c) => c.city, hideOnMobile: true },
    { key: "orders", label: "سفارش", render: (c) => formatNumber(c.orders) },
    { key: "requests", label: "درخواست", render: (c) => formatNumber(c.requests), hideOnMobile: true },
    { key: "state", label: "وضعیت", render: (c) => <Pill tone={c.blocked ? "red" : "green"}>{c.blocked ? "مسدود" : "فعال"}</Pill> },
  ];
  return (
    <>
      <DataTable rows={rows} columns={columns} searchText={(c) => `${c.name} ${c.phone} ${c.city}`} filters={["فعال", "مسدود"]} filterOf={(c) => (c.blocked ? "مسدود" : "فعال")} onRow={setOpen} />
      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title={open?.name ?? ""} subtitle={`عضویت: ${open?.joined ?? ""}`}>
        {open && (
          <>
            <div className="mt-4"><Row label="موبایل" value={<span dir="ltr">{open.phone}</span>} /><Row label="شهر" value={open.city} /><Row label="سفارش‌ها" value={formatNumber(open.orders)} /><Row label="درخواست‌های خدمت" value={formatNumber(open.requests)} /></div>
            <Button className={`${open.blocked ? "primary-button" : "danger-button"} mt-5 w-full justify-center`} onClick={() => setConfirm(true)}>{open.blocked ? "رفع مسدودیت" : "مسدود کردن کاربر"}</Button>
          </>
        )}
      </Modal>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} title={open?.blocked ? "رفع مسدودیت" : "مسدود کردن کاربر"} confirmLabel="تأیید" danger={!open?.blocked}
        reasons={open?.blocked ? undefined : ["سفارش‌های جعلی", "رفتار نامناسب با نصاب", "سوءاستفاده از کد تخفیف"]}
        onConfirm={() => { if (!open) return; const next = { ...open, blocked: !open.blocked }; setRows(rows.map((r) => (r.id === open.id ? next : r))); setOpen(next); toast(next.blocked ? "کاربر مسدود شد" : "مسدودیت برداشته شد"); }} />
    </>
  );
}

// ─────────────────────────────────────────────
// 5. Products + categories
// ─────────────────────────────────────────────

function Products() {
  const { toast } = useApp();
  const [rows, setRows] = useState(products);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [cats, setCats] = useState(categories.map((c) => c.title));
  const [newCat, setNewCat] = useState("");
  const columns: Column<Product>[] = [
    { key: "name", label: "محصول", render: (p) => <div className="flex items-center gap-3"><img src={p.image} alt="" className="size-10 rounded-lg object-cover" /><div><div className="font-bold">{p.name}</div><div className="text-xs text-muted">{p.brand} · {p.model}</div></div></div> },
    { key: "cat", label: "دسته", render: (p) => p.category, hideOnMobile: true },
    { key: "price", label: "قیمت", render: (p) => <div><div className="font-bold">{formatNumber(p.price)}</div>{p.oldPrice && <div className="text-xs text-faint line-through">{formatNumber(p.oldPrice)}</div>}</div> },
    { key: "stock", label: "موجودی", render: (p) => <Pill tone={p.stock === 0 ? "red" : p.stock <= 3 ? "amber" : "green"}>{p.stock === 0 ? "ناموجود" : `${formatNumber(p.stock)} عدد`}</Pill> },
  ];
  return (
    <div className="space-y-5">
      <DataTable rows={rows} columns={columns} searchText={(p) => `${p.name} ${p.brand} ${p.model}`} filters={cats} filterOf={(p) => p.category} onRow={setEditing}
        toolbar={<Button className="primary-button h-10 text-sm" onClick={() => setEditing("new")}><Icon name="plus" size="sm" />افزودن محصول</Button>} />
      <Card title="مدیریت دسته‌بندی‌ها">
        <div className="flex flex-wrap gap-2">{cats.map((cat) => <span key={cat} className="flex items-center gap-2 rounded-xl bg-canvas px-3 py-2 text-sm font-bold">{cat}<span className="text-xs text-muted">{formatNumber(rows.filter((p) => p.category === cat).length)}</span></span>)}</div>
        <div className="mt-4 flex max-w-sm gap-2"><input className="form-field mt-0 flex-1" placeholder="نام دسته جدید" value={newCat} onChange={(event) => setNewCat(event.target.value)} /><Button className="secondary-button h-auto px-4" disabled={!newCat.trim() || cats.includes(newCat.trim())} onClick={() => { setCats([...cats, newCat.trim()]); setNewCat(""); toast("دسته اضافه شد"); }}>افزودن</Button></div>
      </Card>
      {editing && <ProductForm key={editing === "new" ? "new" : editing.id} product={editing === "new" ? undefined : editing} categories={cats} onClose={() => setEditing(null)}
        onSave={(product) => { setRows(rows.some((p) => p.id === product.id) ? rows.map((p) => (p.id === product.id ? product : p)) : [product, ...rows]); setEditing(null); toast("محصول ذخیره شد"); }} />}
    </div>
  );
}

function ProductForm({ product, categories: cats, onClose, onSave }: { product?: Product; categories: string[]; onClose: () => void; onSave: (p: Product) => void }) {
  const [form, setForm] = useState<Product>(product ?? { ...products[0], id: Math.max(...products.map((p) => p.id)) + 100, name: "", model: "", brand: brands[0], price: 0, oldPrice: undefined, stock: 0, description: "", specs: [{ label: "توان", value: "" }], gallery: [products[0].image], badge: "جدید", sold: 0, reviewCount: 0, rating: 0 });
  const set = <K extends keyof Product>(key: K, value: Product[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const num = (value: string) => Number(value.replace(/[^\d۰-۹]/g, "").replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))) || 0;
  const valid = form.name.trim() && form.price > 0 && (!form.oldPrice || form.oldPrice > form.price);
  return (
    <Modal open onClose={onClose} title={product ? "ویرایش محصول" : "افزودن محصول"} subtitle="" wide>
      <div className="mt-2 grid gap-x-4 sm:grid-cols-2">
        <label className="form-label">نام محصول<input className="form-field" value={form.name} onChange={(e) => set("name", e.target.value)} /></label>
        <label className="form-label">مدل<input className="form-field" value={form.model} onChange={(e) => set("model", e.target.value)} /></label>
        <label className="form-label">دسته‌بندی<select className="form-field" value={form.category} onChange={(e) => set("category", e.target.value)}>{cats.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="form-label">برند<input className="form-field" list="brand-list" value={form.brand} onChange={(e) => set("brand", e.target.value)} /><datalist id="brand-list">{brands.map((b) => <option key={b} value={b} />)}</datalist></label>
        <label className="form-label">قیمت فروش (تومان)<input className="form-field" inputMode="numeric" value={formatNumber(form.price)} onChange={(e) => set("price", num(e.target.value))} /></label>
        <label className="form-label">قیمت قبل از تخفیف (اختیاری)<input className="form-field" inputMode="numeric" value={form.oldPrice ? formatNumber(form.oldPrice) : ""} onChange={(e) => set("oldPrice", num(e.target.value) || undefined)} /></label>
        <label className="form-label">موجودی انبار<input className="form-field" inputMode="numeric" value={formatNumber(form.stock)} onChange={(e) => set("stock", num(e.target.value))} /></label>
        <label className="form-label">برچسب<input className="form-field" value={form.badge} onChange={(e) => set("badge", e.target.value)} /></label>
      </div>
      {form.oldPrice !== undefined && form.oldPrice <= form.price && <div className="mt-2 text-xs font-bold text-red-600">قیمت قبل از تخفیف باید بیشتر از قیمت فروش باشد.</div>}
      <div className="form-label">تصاویر</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {form.gallery.map((src, i) => <div key={src + i} className="relative"><img src={src} alt="" className="size-20 rounded-xl object-cover" /><Button className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-ink/75 text-white" onClick={() => set("gallery", form.gallery.filter((_, j) => j !== i))} label="حذف تصویر"><Icon name="close" size="sm" /></Button></div>)}
        <Button className="flex size-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-xs font-bold text-muted" onClick={() => set("gallery", [...form.gallery, products[form.gallery.length % products.length].image])}><Icon name="plus" />تصویر</Button>
      </div>
      <div className="form-label">مشخصات فنی</div>
      <div className="mt-2 space-y-2">
        {form.specs.map((spec, i) => (
          <div key={i} className="flex gap-2">
            <input className="form-field mt-0 w-40" placeholder="عنوان (مثلاً ولتاژ)" value={spec.label} onChange={(e) => set("specs", form.specs.map((s, j) => (j === i ? { ...s, label: e.target.value } : s)))} />
            <input className="form-field mt-0 flex-1" placeholder="مقدار" value={spec.value} onChange={(e) => set("specs", form.specs.map((s, j) => (j === i ? { ...s, value: e.target.value } : s)))} />
            <Button className="icon-action" onClick={() => set("specs", form.specs.filter((_, j) => j !== i))} label="حذف"><Icon name="trash" size="sm" /></Button>
          </div>
        ))}
        <Button className="text-link" onClick={() => set("specs", [...form.specs, { label: "", value: "" }])}><Icon name="plus" size="sm" />افزودن ردیف</Button>
      </div>
      <label className="form-label">توضیحات<textarea className="form-field min-h-24 resize-none" value={form.description} onChange={(e) => set("description", e.target.value)} /></label>
      <div className="mt-6 flex gap-2"><Button className="primary-button flex-1 justify-center" disabled={!valid} onClick={() => onSave({ ...form, image: form.gallery[0] ?? products[0].image })}>ذخیره محصول</Button><Button className="secondary-button px-6" onClick={onClose}>انصراف</Button></div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
// 6. Orders
// ─────────────────────────────────────────────

function Orders() {
  const { toast } = useApp();
  const [rows, setRows] = useState(adminOrders);
  const [open, setOpen] = useState<(typeof rows)[number] | null>(null);
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "id", label: "شماره", render: (o) => <span className="font-bold">#{formatId(o.id)}</span> },
    { key: "customer", label: "مشتری", render: (o) => o.customer },
    { key: "product", label: "کالا", render: (o) => <span className="text-muted">{o.product}{o.items > 1 ? ` (${formatNumber(o.items)} عدد)` : ""}</span>, hideOnMobile: true },
    { key: "date", label: "تاریخ", render: (o) => o.date, hideOnMobile: true },
    { key: "total", label: "مبلغ", render: (o) => formatNumber(o.total), hideOnMobile: true },
    { key: "status", label: "وضعیت", render: (o) => <Pill tone={orderTone[o.status]}>{orderStatusLabel[o.status]}</Pill> },
  ];
  return (
    <>
      <DataTable rows={rows} columns={columns} searchText={(o) => `${o.id} ${o.customer} ${o.product}`} filters={Object.values(orderStatusLabel)} filterOf={(o) => orderStatusLabel[o.status]} onRow={setOpen} />
      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title={`سفارش #${formatId(open?.id ?? 0)}`} subtitle={open ? `${open.customer} · ${open.date}` : ""}>
        {open && (
          <>
            <div className="mt-4"><Row label="کالا" value={open.product} /><Row label="تعداد" value={formatNumber(open.items)} /><Row label="مبلغ کل" value={formatPrice(open.total)} /><Row label="روش ارسال" value="پست پیشتاز" /></div>
            <label className="form-label">تغییر وضعیت
              <select className="form-field" value={open.status} onChange={(e) => { const next = { ...open, status: e.target.value as OrderStatus }; setOpen(next); setRows(rows.map((r) => (r.id === next.id ? next : r))); toast(`وضعیت سفارش: ${orderStatusLabel[next.status]} — به مشتری اطلاع داده شد`); }}>
                {(Object.keys(orderStatusLabel) as OrderStatus[]).map((s) => <option key={s} value={s}>{orderStatusLabel[s]}</option>)}
              </select>
            </label>
            {open.status === "shipped" && <label className="form-label">کد رهگیری مرسوله<input className="form-field" dir="ltr" placeholder="کد رهگیری پست" /></label>}
          </>
        )}
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────
// 7. Service requests
// ─────────────────────────────────────────────

function Requests() {
  const { toast } = useApp();
  const [rows, setRows] = useState(adminRequests);
  const [open, setOpen] = useState<(typeof rows)[number] | null>(null);
  const techName = (id: number | null) => extendedTechnicians.find((t) => t.id === id)?.name ?? "—";
  const columns: Column<(typeof rows)[number]>[] = [
    { key: "id", label: "شماره", render: (r) => <span className="font-bold">#{formatId(r.id)}</span> },
    { key: "service", label: "خدمت", render: (r) => <div><div className="font-bold">{r.service}</div><div className="text-xs text-muted">{r.customer} · {r.area}</div></div> },
    { key: "tech", label: "نصاب", render: (r) => techName(r.technicianId), hideOnMobile: true },
    { key: "date", label: "تاریخ", render: (r) => r.date, hideOnMobile: true },
    { key: "status", label: "وضعیت", render: (r) => <Pill tone={requestTone(r.status)}>{requestStatusLabel[r.status]}</Pill> },
  ];
  const timeline: ServiceRequestStatus[] = ["waiting", "accepted", "quote", "enroute", "done", "paid", "rated"];
  return (
    <>
      <DataTable rows={rows} columns={columns} searchText={(r) => `${r.id} ${r.customer} ${r.service} ${r.area}`} filters={["در انتظار پذیرش", "در انتظار تأیید قیمت", "نصاب در راه", "تکمیل‌شده", "لغوشده"]} filterOf={(r) => requestStatusLabel[r.status]} onRow={setOpen} />
      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title={`درخواست #${formatId(open?.id ?? 0)}`} subtitle={open ? `${open.service} · ${open.customer} · ${open.area}` : ""} wide>
        {open && (
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <div className="mb-3 text-sm font-black">روند درخواست</div>
              {open.status === "cancelled" ? <Pill tone="red">لغو شده توسط مشتری — تغییر برنامه</Pill> : timeline.map((s, i) => {
                const reached = i <= timeline.indexOf(open.status);
                return <div key={s} className="flex items-center gap-3 py-1.5 text-sm"><span className={`flex size-6 items-center justify-center rounded-full text-xs ${reached ? "bg-brand text-white" : "bg-line text-muted"}`}>{reached ? <Icon name="check" size="sm" /> : formatNumber(i + 1)}</span><span className={reached ? "font-bold" : "text-muted"}>{requestStatusLabel[s]}</span></div>;
              })}
            </div>
            <div>
              <Row label="مبلغ" value={formatPrice(open.amount)} />
              <Row label="کمیسیون (۱۲٪ دستمزد)" value={formatPrice(Math.round(open.amount * 0.12))} />
              <Row label="نصاب فعلی" value={techName(open.technicianId)} />
              <label className="form-label">تخصیص / تغییر نصاب
                <select className="form-field" value={open.technicianId ?? ""} onChange={(e) => { const next = { ...open, technicianId: Number(e.target.value) || null }; setOpen(next); setRows(rows.map((r) => (r.id === next.id ? next : r))); toast(`درخواست به ${techName(next.technicianId)} تخصیص داده شد`); }}>
                  <option value="">— بدون نصاب —</option>
                  {extendedTechnicians.map((t) => <option key={t.id} value={t.id} disabled={t.status !== "آنلاین"}>{t.name} ({t.status})</option>)}
                </select>
              </label>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────
// 8. Commission & settlements
// ─────────────────────────────────────────────

function Commission() {
  const { toast } = useApp();
  const [global, setGlobal] = useState(commissionSettings.global);
  const [byService, setByService] = useState(commissionSettings.byService);
  const [byRegion, setByRegion] = useState(commissionSettings.byRegion);
  const [pending, setPending] = useState(pendingSettlements);
  const [paid, setPaid] = useState<typeof pendingSettlements>([]);
  const rate = (value: number, onChange: (v: number) => void) => (
    <div className="flex items-center gap-1"><input className="form-field mt-0 w-20 py-2 text-center" inputMode="numeric" value={formatNumber(value)} onChange={(e) => onChange(Math.min(50, Number(e.target.value.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/\D/g, "")) || 0))} /><span className="text-sm text-muted">٪</span></div>
  );
  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-3">
        <Card title="کمیسیون پایه">
          <div className="flex items-center justify-between text-sm"><span className="text-muted">درصد از دستمزد هر خدمت</span>{rate(global, setGlobal)}</div>
          <div className="mt-4 rounded-2xl bg-canvas p-3 text-xs leading-6 text-muted">اولویت اعمال: منطقه ← نوع خدمت ← پایه. کمیسیون فقط از دستمزد کسر می‌شود، نه از قطعات.</div>
        </Card>
        <Card title="بر اساس نوع خدمت">{byService.map((item, i) => <div key={item.service} className="flex items-center justify-between border-b border-line py-2 text-sm last:border-0"><span>{item.service}</span>{rate(item.rate, (v) => setByService(byService.map((s, j) => (j === i ? { ...s, rate: v } : s))))}</div>)}</Card>
        <Card title="بر اساس منطقه">{byRegion.map((item, i) => <div key={item.region} className="flex items-center justify-between border-b border-line py-2 text-sm last:border-0"><span>{item.region}</span>{rate(item.rate, (v) => setByRegion(byRegion.map((s, j) => (j === i ? { ...s, rate: v } : s))))}</div>)}</Card>
      </div>
      <Button className="primary-button" onClick={() => toast("تنظیمات کمیسیون ذخیره شد؛ از درخواست‌های جدید اعمال می‌شود")}>ذخیره تنظیمات کمیسیون</Button>

      <Card title="تسویه‌های در انتظار (دوره ۱ تا ۱۵ مهر)" action={pending.length > 0 && <Button className="secondary-button h-10 text-sm" onClick={() => { setPaid([...pending, ...paid]); setPending([]); toast("همه تسویه‌ها پرداخت شد"); }}>پرداخت همه</Button>}>
        {pending.length ? (
          <div className="overflow-x-auto"><table className="admin-table">
            <thead><tr><th>نصاب</th><th>کار</th><th className="hidden md:table-cell">ناخالص</th><th className="hidden md:table-cell">کمیسیون</th><th>قابل پرداخت</th><th /></tr></thead>
            <tbody>{pending.map((s) => <tr key={s.id}><td className="font-bold">{s.technician}</td><td>{formatNumber(s.jobs)}</td><td className="hidden md:table-cell">{formatNumber(s.gross)}</td><td className="hidden md:table-cell">{formatNumber(s.commission)}</td><td className="font-black">{formatNumber(s.gross - s.commission)}</td><td><Button className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-black text-green-700" onClick={() => { setPending(pending.filter((p) => p.id !== s.id)); setPaid([s, ...paid]); toast(`تسویه ${s.technician} ثبت شد`); }}>پرداخت شد</Button></td></tr>)}</tbody>
          </table></div>
        ) : <div className="py-6 text-center text-sm text-muted">تسویه در انتظاری وجود ندارد.</div>}
      </Card>
      {paid.length > 0 && <Card title="پرداخت‌شده در این جلسه">{paid.map((s) => <Row key={s.id} label={s.technician} value={formatPrice(s.gross - s.commission)} />)}</Card>}
    </div>
  );
}

// ─────────────────────────────────────────────
// 9. Transactions
// ─────────────────────────────────────────────

function Transactions() {
  const columns: Column<(typeof transactions)[number]>[] = [
    { key: "id", label: "شناسه", render: (t) => <span className="font-bold">{formatId(t.id)}</span> },
    { key: "type", label: "نوع", render: (t) => t.type },
    { key: "party", label: "طرف حساب", render: (t) => t.party, hideOnMobile: true },
    { key: "date", label: "تاریخ", render: (t) => t.date, hideOnMobile: true },
    { key: "gateway", label: "درگاه", render: (t) => t.gateway, hideOnMobile: true },
    { key: "amount", label: "مبلغ", render: (t) => <span className={`font-bold ${t.type === "بازگشت وجه" || t.type === "تسویه نصاب" ? "text-red-600" : ""}`}>{t.type === "بازگشت وجه" || t.type === "تسویه نصاب" ? "−" : ""}{formatNumber(t.amount)}</span> },
    { key: "status", label: "وضعیت", render: (t) => <Pill tone={t.status === "موفق" ? "green" : "red"}>{t.status}</Pill> },
  ];
  return <DataTable rows={transactions} columns={columns} pageSize={10} searchText={(t) => `${t.id} ${t.party} ${t.ref}`} filters={["خرید کالا", "پرداخت خدمت", "تسویه نصاب", "بازگشت وجه"]} filterOf={(t) => t.type}
    toolbar={<Button className="secondary-button h-10 text-sm" onClick={() => downloadCsv("transactions.csv", ["شناسه", "تاریخ", "نوع", "طرف حساب", "مبلغ", "درگاه", "وضعیت", "کد پیگیری"], transactions.map((t) => [t.id, t.date, t.type, t.party, t.amount, t.gateway, t.status, t.ref]))}><Icon name="file" size="sm" />خروجی اکسل</Button>} />;
}

// ─────────────────────────────────────────────
// 10. Discounts
// ─────────────────────────────────────────────

function Discounts() {
  const { toast } = useApp();
  const [rows, setRows] = useState(adminDiscounts);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", kind: "percent" as "percent" | "fixed", value: "", minOrder: "", expires: "", limit: "" });
  const valid = /^[A-Z0-9]{4,16}$/.test(form.code) && Number(form.value) > 0 && (form.kind === "fixed" || Number(form.value) <= 90) && !rows.some((r) => r.code === form.code);
  return (
    <>
      <div className="mb-4 flex justify-end"><Button className="primary-button h-10 text-sm" onClick={() => setOpen(true)}><Icon name="plus" size="sm" />کد تخفیف جدید</Button></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {rows.map((d) => (
          <div key={d.code} className={`admin-card ${d.active ? "" : "opacity-60"}`}>
            <div className="flex items-center justify-between"><span className="font-black tracking-wider" dir="ltr">{d.code}</span><Toggle checked={d.active} label={`فعال بودن ${d.code}`} onChange={(v) => { setRows(rows.map((r) => (r.code === d.code ? { ...r, active: v } : r))); toast(v ? "کد فعال شد" : "کد غیرفعال شد"); }} /></div>
            <div className="mt-3 text-2xl font-black text-brand">{d.kind === "percent" ? `${formatNumber(d.value)}٪` : formatPrice(d.value)}</div>
            <div className="mt-3 space-y-1 text-xs text-muted"><div>حداقل خرید: {d.minOrder ? formatPrice(d.minOrder) : "ندارد"}</div><div>انقضا: {d.expires}</div><div>استفاده: {formatNumber(d.used)}{d.limit ? ` از ${formatNumber(d.limit)}` : " (نامحدود)"}</div></div>
            {d.limit > 0 && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas"><div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, (d.used / d.limit) * 100)}%` }} /></div>}
          </div>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="ساخت کد تخفیف" subtitle="">
        <label className="form-label">کد (حروف لاتین بزرگ و عدد)<input className="form-field uppercase tracking-wider" dir="ltr" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} placeholder="MEHR20" /></label>
        {rows.some((r) => r.code === form.code) && <div className="mt-1 text-xs font-bold text-red-600">این کد قبلاً ساخته شده است</div>}
        <div className="mt-4 flex gap-2">{(["percent", "fixed"] as const).map((k) => <Button key={k} className={`filter-chip flex-1 ${form.kind === k ? "filter-chip-active" : ""}`} onClick={() => setForm({ ...form, kind: k })}>{k === "percent" ? "درصدی" : "مبلغ ثابت"}</Button>)}</div>
        <div className="grid gap-x-3 sm:grid-cols-2">
          <label className="form-label">{form.kind === "percent" ? "درصد تخفیف" : "مبلغ (تومان)"}<input className="form-field" inputMode="numeric" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value.replace(/\D/g, "") })} /></label>
          <label className="form-label">حداقل خرید (تومان)<input className="form-field" inputMode="numeric" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value.replace(/\D/g, "") })} /></label>
          <label className="form-label">تاریخ انقضا<input className="form-field" placeholder="۳۰ مهر ۱۴۰۵" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} /></label>
          <label className="form-label">سقف استفاده (خالی = نامحدود)<input className="form-field" inputMode="numeric" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value.replace(/\D/g, "") })} /></label>
        </div>
        <Button className="primary-button mt-6 w-full justify-center" disabled={!valid} onClick={() => { setRows([{ code: form.code, kind: form.kind, value: Number(form.value), minOrder: Number(form.minOrder) || 0, expires: form.expires || "بدون انقضا", used: 0, limit: Number(form.limit) || 0, active: true }, ...rows]); setOpen(false); setForm({ code: "", kind: "percent", value: "", minOrder: "", expires: "", limit: "" }); toast("کد تخفیف ساخته شد"); }}>ساخت کد</Button>
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────
// 11. Reviews moderation
// ─────────────────────────────────────────────

function Reviews() {
  const { toast } = useApp();
  const [rows, setRows] = useState(moderationReviews);
  const [filter, setFilter] = useState("همه");
  const set = (id: number, state: string) => { setRows(rows.map((r) => (r.id === id ? { ...r, state } : r))); toast(state === "منتشرشده" ? "نظر منتشر شد" : "نظر مخفی شد"); };
  return (
    <>
      <div className="mb-4 flex gap-1">{["همه", "در انتظار", "گزارش‌شده", "منتشرشده", "مخفی"].map((f) => <Button key={f} className={`rounded-lg px-3 py-2 text-xs font-bold ${filter === f ? "bg-brand text-white" : "bg-white text-muted"}`} onClick={() => setFilter(f)}>{f}</Button>)}</div>
      <div className="grid gap-3 lg:grid-cols-2">
        {rows.filter((r) => filter === "همه" || r.state === filter).map((r) => (
          <div key={r.id} className={`admin-card ${r.state === "گزارش‌شده" ? "border-red-200" : ""}`}>
            <div className="flex items-start justify-between gap-3"><div><div className="font-bold">{r.author}</div><div className="text-xs text-muted">درباره: {r.target} · {r.date}</div></div><Pill tone={r.state === "منتشرشده" ? "green" : r.state === "گزارش‌شده" ? "red" : r.state === "مخفی" ? "gray" : "amber"}>{r.state}</Pill></div>
            <div className="mt-2 text-sm text-amber-600">{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span></div>
            <div className="mt-2 text-sm leading-7 text-muted">{r.text}</div>
            <div className="mt-3 flex gap-2">
              {r.state !== "منتشرشده" && <Button className="rounded-lg bg-green-50 px-3 py-2 text-xs font-black text-green-700" onClick={() => set(r.id, "منتشرشده")}>تأیید و انتشار</Button>}
              {r.state !== "مخفی" && <Button className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-600" onClick={() => set(r.id, "مخفی")}>مخفی کردن</Button>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// 12. Reports
// ─────────────────────────────────────────────

function Reports() {
  const [range, setRange] = useState<3 | 6>(6);
  const data = monthlyReport.slice(-range);
  const sum = (key: "sales" | "services" | "commission") => data.reduce((acc, row) => acc + row[key], 0);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-muted">بازه:</span>
        {([3, 6] as const).map((r) => <Button key={r} className={`rounded-lg px-3 py-2 text-xs font-bold ${range === r ? "bg-brand text-white" : "bg-white text-muted"}`} onClick={() => setRange(r)}>{formatNumber(r)} ماه اخیر</Button>)}
        <Button className="secondary-button mr-auto h-10 text-sm" onClick={() => downloadCsv("hanifi-report.csv", ["ماه", "فروش (میلیون تومان)", "تعداد خدمات", "کمیسیون (میلیون تومان)"], data.map((d) => [d.month, d.sales, d.services, d.commission]))}><Icon name="file" size="sm" />خروجی اکسل</Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi icon="bag" label="فروش مستقیم" value={formatNumber(sum("sales"))} hint="میلیون تومان" />
        <Kpi icon="tool" label="خدمات انجام‌شده" value={formatNumber(sum("services"))} hint="درخواست" />
        <Kpi icon="percent" label="درآمد کمیسیون" value={formatDecimal(sum("commission"))} hint="میلیون تومان" />
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Card title="فروش مستقیم (میلیون تومان)"><ColumnChart data={data.map((d) => ({ label: d.month, value: d.sales }))} unit="میلیون تومان" /></Card>
        <Card title="خدمات انجام‌شده (تعداد)"><ColumnChart data={data.map((d) => ({ label: d.month, value: d.services }))} unit="خدمت" /></Card>
        <Card title="کمیسیون خدمات (میلیون تومان)"><ColumnChart data={data.map((d) => ({ label: d.month, value: d.commission }))} unit="میلیون تومان" /></Card>
      </div>
      <Card title="جدول ماهانه">
        <div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>ماه</th><th>فروش</th><th>خدمات</th><th>کمیسیون</th></tr></thead><tbody>{data.map((d) => <tr key={d.month}><td className="font-bold">{d.month}</td><td>{formatNumber(d.sales)}</td><td>{formatNumber(d.services)}</td><td>{formatDecimal(d.commission)}</td></tr>)}</tbody></table></div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// 13. Notifications
// ─────────────────────────────────────────────

function Notifications() {
  const { toast } = useApp();
  const [history, setHistory] = useState(sentNotifications);
  const [audience, setAudience] = useState("همه مشتریان");
  const [region, setRegion] = useState("همه مناطق");
  const [channels, setChannels] = useState({ push: true, sms: false });
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const reach = { "همه مشتریان": 5480, "همه نصاب‌ها": 64, "مشتریان منطقه": 3120, "نصاب‌های منطقه": 48 }[audience] ?? 0;
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <Card title="ارسال اعلان" className="xl:col-span-2">
        <div className="flex flex-wrap gap-2">{["همه مشتریان", "همه نصاب‌ها", "مشتریان منطقه", "نصاب‌های منطقه"].map((a) => <Button key={a} className={`filter-chip ${audience === a ? "filter-chip-active" : ""}`} onClick={() => setAudience(a)}>{a}</Button>)}</div>
        {audience.includes("منطقه") && <label className="form-label">منطقه<select className="form-field" value={region} onChange={(e) => setRegion(e.target.value)}>{["همه مناطق", ...coverageRegions.map((r) => r.city)].map((r) => <option key={r}>{r}</option>)}</select></label>}
        <label className="form-label">عنوان<input className="form-field" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="form-label">متن پیام<textarea className="form-field min-h-24 resize-none" maxLength={160} value={body} onChange={(e) => setBody(e.target.value)} /></label>
        <div className="mt-1 text-left text-xs text-faint">{formatNumber(body.length)}/۱۶۰</div>
        <div className="mt-3 flex flex-wrap items-center gap-5 text-sm font-bold">
          <span className="flex items-center gap-2">اعلان اپ<Toggle checked={channels.push} onChange={(v) => setChannels({ ...channels, push: v })} label="اعلان اپ" /></span>
          <span className="flex items-center gap-2">پیامک<Toggle checked={channels.sms} onChange={(v) => setChannels({ ...channels, sms: v })} label="پیامک" /></span>
          <span className="mr-auto text-xs text-muted">گیرندگان: حدود {formatNumber(reach)} نفر</span>
        </div>
        <Button className="primary-button mt-5" disabled={!title.trim() || !body.trim() || (!channels.push && !channels.sms)} onClick={() => { setHistory([{ id: Date.now(), audience: audience.includes("منطقه") ? `${audience} (${region})` : audience, title, date: "۵ مهر", reach }, ...history]); setTitle(""); setBody(""); toast("اعلان ارسال شد"); }}><Icon name="send" size="sm" />ارسال</Button>
      </Card>
      <Card title="تاریخچه ارسال">{history.map((n) => <div key={n.id} className="border-b border-line py-3 text-sm last:border-0"><div className="font-bold">{n.title}</div><div className="mt-1 text-xs text-muted">{n.audience} · {n.date} · {formatNumber(n.reach)} گیرنده</div></div>)}</Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// 14. Coverage regions
// ─────────────────────────────────────────────

function Coverage() {
  const { toast } = useApp();
  const [rows, setRows] = useState(coverageRegions);
  const [city, setCity] = useState("");
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <MapBg className="h-80">
          {rows.map((r, i) => <div key={r.id} className={`tech-zone ${r.active ? "tech-zone-online" : "tech-zone-offline"}`} style={{ left: `${[45, 25, 68, 60][i % 4]}%`, top: `${[40, 55, 30, 72][i % 4]}%`, width: 60 + r.technicians * 2, height: 60 + r.technicians * 2 }}><span className="rounded-full bg-white px-2 py-1 text-xs font-black shadow">{r.city} · {formatNumber(r.technicians)}</span></div>)}
        </MapBg>
        <div className="mt-2 text-xs text-muted">اندازه دایره = تعداد نصاب فعال. در نسخه واقعی، مرز مناطق روی نقشه رسم و ویرایش می‌شود.</div>
      </Card>
      <Card title="شهرها و مناطق">
        {rows.map((r) => (
          <div key={r.id} className="border-b border-line py-3 last:border-0">
            <div className="flex items-center justify-between"><span className="font-bold">{r.city}</span><Toggle checked={r.active} label={`فعال بودن ${r.city}`} onChange={(v) => { setRows(rows.map((x) => (x.id === r.id ? { ...x, active: v } : x))); toast(`${r.city} ${v ? "فعال" : "غیرفعال"} شد`); }} /></div>
            <div className="mt-2 flex flex-wrap gap-1">{r.areas.map((a) => <Pill key={a}>{a}</Pill>)}</div>
            <div className="mt-1 text-xs text-muted">{formatNumber(r.technicians)} نصاب فعال</div>
          </div>
        ))}
        <div className="mt-4 flex gap-2"><input className="form-field mt-0 flex-1" placeholder="شهر جدید" value={city} onChange={(e) => setCity(e.target.value)} /><Button className="secondary-button h-auto px-4" disabled={!city.trim()} onClick={() => { setRows([...rows, { id: Date.now(), city: city.trim(), areas: ["مرکز"], technicians: 0, active: false }]); setCity(""); toast("شهر اضافه شد (غیرفعال تا جذب نصاب)"); }}>افزودن</Button></div>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// 15. Admin users & roles
// ─────────────────────────────────────────────

const permissions: Record<string, string[]> = {
  "مدیر کل": ["همه بخش‌ها"],
  "مدیر فروشگاه": ["محصولات", "سفارش‌ها", "کدهای تخفیف", "نظرات"],
  "کارشناس احراز هویت": ["احراز هویت نصاب‌ها", "نصاب‌ها"],
  مالی: ["کمیسیون و تسویه", "تراکنش‌ها", "گزارشات"],
  پشتیبانی: ["کاربران", "سفارش‌ها", "درخواست‌های خدمت", "اعلان‌ها"],
};

function Admins() {
  const { toast } = useApp();
  const [rows, setRows] = useState(adminUsers);
  const [invite, setInvite] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: adminRoles[1] });
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <Card title="مدیران" className="xl:col-span-2" action={<Button className="primary-button h-10 text-sm" onClick={() => setInvite(true)}><Icon name="plus" size="sm" />دعوت مدیر</Button>}>
        {rows.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-3 border-b border-line py-3 last:border-0">
            <span className="avatar avatar-1 size-10"><Icon name="user" size="sm" /></span>
            <div className="min-w-0 flex-1"><div className="font-bold">{u.name}</div><div className="text-xs text-muted" dir="ltr">{u.email}</div></div>
            <span className="text-xs text-muted">{u.lastSeen}</span>
            <select className="rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-bold" value={u.role} disabled={u.id === 1} onChange={(e) => { setRows(rows.map((r) => (r.id === u.id ? { ...r, role: e.target.value } : r))); toast(`نقش ${u.name} تغییر کرد`); }}>{adminRoles.map((r) => <option key={r}>{r}</option>)}</select>
          </div>
        ))}
      </Card>
      <Card title="دسترسی نقش‌ها">{Object.entries(permissions).map(([role, list]) => <div key={role} className="border-b border-line py-3 last:border-0"><div className="text-sm font-bold">{role}</div><div className="mt-2 flex flex-wrap gap-1">{list.map((p) => <Pill key={p}>{p}</Pill>)}</div></div>)}</Card>
      <Modal open={invite} onClose={() => setInvite(false)} title="دعوت مدیر جدید" subtitle="لینک ورود برای ایمیل ارسال می‌شود.">
        <label className="form-label">نام<input className="form-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="form-label">ایمیل سازمانی<input className="form-field" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label className="form-label">نقش<select className="form-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{adminRoles.map((r) => <option key={r}>{r}</option>)}</select></label>
        <Button className="primary-button mt-6 w-full justify-center" disabled={!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)} onClick={() => { setRows([...rows, { id: Date.now(), ...form, lastSeen: "دعوت ارسال شد" }]); setInvite(false); setForm({ name: "", email: "", role: adminRoles[1] }); toast("دعوت‌نامه ارسال شد"); }}>ارسال دعوت‌نامه</Button>
      </Modal>
    </div>
  );
}
