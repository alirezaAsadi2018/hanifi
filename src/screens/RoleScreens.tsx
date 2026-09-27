import { products, requests, technicians } from "../data/mock";
import type { Navigate } from "../types";
import Icon from "../components/Icon";
import { Button, formatNumber, formatPrice } from "../components/ui";

export function TechnicianDashboard({ navigate }: { navigate: Navigate }) {
  return <RolePage title="سلام علیرضا، روز بخیر" subtitle="وضعیت امروز و درخواست‌های نزدیک شما">
    <div className="status-panel"><div><div className="text-sm text-white/65">وضعیت فعالیت</div><div className="mt-1 text-xl font-black text-white">آنلاین و آماده دریافت کار</div></div><Button className="rounded-xl bg-white px-4 py-3 text-sm font-black text-brand" onClick={() => navigate("technician-profile")}>تغییر وضعیت</Button></div>
    <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat icon="wallet" value={formatPrice(4850000)} label="درآمد این ماه" /><Stat icon="orders" value={formatNumber(18)} label="پروژه تکمیل‌شده" /><Stat icon="star" value={(4.9).toLocaleString("fa-IR")} label="امتیاز شما" /><Stat icon="chart" value={`${formatNumber(96)}٪`} label="نرخ پذیرش" /></div>
    <div className="mt-7 flex items-center justify-between"><div className="text-xl font-black">درخواست‌های جدید</div><Button className="text-link" onClick={() => navigate("technician-requests")}>مشاهده همه <Icon name="arrow" /></Button></div>
    <RequestList navigate={navigate} />
  </RolePage>;
}

export function TechnicianRequests({ navigate }: { navigate: Navigate }) {
  return <RolePage title="درخواست‌های خدمات" subtitle="درخواست‌های نزدیک و کارهای پذیرفته‌شده"><div className="mb-5 flex gap-2"><Button className="filter-chip filter-chip-active">جدید</Button><Button className="filter-chip" onClick={() => navigate("technician-dashboard")}>پذیرفته‌شده</Button><Button className="filter-chip" onClick={() => navigate("technician-dashboard")}>تکمیل‌شده</Button></div><RequestList navigate={navigate} /></RolePage>;
}

function RequestList({ navigate }: { navigate: Navigate }) {
  return <div className="mt-4 grid gap-3">{requests.map((request) => <div className="surface-card" key={request.id}><div className="flex items-start justify-between"><div><div className="text-xs font-bold text-brand">درخواست شماره {formatNumber(request.id)}</div><div className="mt-2 text-lg font-black">{request.service}</div><div className="mt-1 text-sm text-muted">{request.customer} · {request.area}</div></div><span className="status-badge">{request.status}</span></div><div className="mt-5 flex flex-wrap items-center gap-4 border-t border-line pt-4 text-sm"><span className="flex items-center gap-2"><Icon name="clock" />{request.time}</span><span className="font-black">{formatPrice(request.fee)}</span><Button className="primary-button mr-auto h-11" onClick={() => navigate("technician-profile")}>مشاهده جزئیات</Button></div></div>)}</div>;
}

export function TechnicianProfile({ navigate }: { navigate: Navigate }) {
  return <RolePage title="پروفایل حرفه‌ای من" subtitle="اطلاعاتی که مشتریان پیش از انتخاب می‌بینند"><div className="grid gap-5 lg:grid-cols-3"><div className="surface-card text-center"><span className="avatar avatar-1 mx-auto"><Icon name="user" size="lg" /></span><div className="mt-3 text-xl font-black">علیرضا صادقی</div><div className="mt-1 text-sm text-muted">نصب و تعمیر پمپ</div><span className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-2 text-xs font-bold text-brand"><Icon name="shield" size="sm" />احراز هویت‌شده</span></div><div className="surface-card lg:col-span-2"><div className="font-black">وضعیت مدارک</div>{["کارت ملی و تصویر شخص", "گواهی فنی حرفه‌ای", "اطلاعات بانکی", "محدوده فعالیت"].map((item) => <div className="menu-row" key={item}><span>{item}</span><span className="flex items-center gap-1 text-xs font-bold text-success"><Icon name="check" size="sm" />تأییدشده</span></div>)}<Button className="secondary-button mt-5" onClick={() => navigate("technician-dashboard")}>بازگشت به داشبورد</Button></div></div></RolePage>;
}

export function AdminDashboard({ navigate }: { navigate: Navigate }) {
  return <RolePage title="داشبورد مدیریت" subtitle="نمای کلی عملکرد فروشگاه و شبکه خدمات"><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat icon="wallet" value={formatPrice(284500000)} label="فروش این ماه" /><Stat icon="tool" value={formatNumber(148)} label="درخواست خدمات" /><Stat icon="users" value={formatNumber(64)} label="نصاب فعال" /><Stat icon="box" value={formatNumber(286)} label="سفارش ثبت‌شده" /></div><div className="mt-7 grid gap-5 lg:grid-cols-3"><div className="surface-card lg:col-span-2"><div className="flex justify-between"><div className="font-black">عملکرد هفتگی</div><span className="text-xs text-success">{formatNumber(12)}٪ رشد</span></div><div className="chart-bars">{Array.from({ length: 7 }, (_, index) => <span key={index} className={`chart-bar-${index + 1}`} />)}</div></div><div className="surface-card"><div className="font-black">کارهای نیازمند بررسی</div><AdminLink label="احراز هویت نصاب‌ها" count={8} onClick={() => navigate("admin-technicians")} /><AdminLink label="محصولات کم‌موجودی" count={5} onClick={() => navigate("admin-products")} /><AdminLink label="نظرات گزارش‌شده" count={2} onClick={() => navigate("notifications")} /></div></div></RolePage>;
}

export function AdminProducts({ navigate }: { navigate: Navigate }) {
  return <RolePage title="مدیریت محصولات" subtitle="موجودی، قیمت و وضعیت فروش محصولات"><div className="mb-5 flex justify-end"><Button className="primary-button" onClick={() => navigate("admin-dashboard")}><Icon name="plus" />افزودن محصول</Button></div><div className="overflow-hidden rounded-3xl border border-line bg-white">{products.map((product) => <div className="admin-row" key={product.id}><img className="size-14 rounded-xl object-cover" src={product.image} alt={product.name} /><div className="min-w-0 flex-1"><div className="truncate font-black">{product.name}</div><div className="mt-1 text-xs text-muted">{product.category}</div></div><div className="hidden text-sm font-bold sm:block">{formatPrice(product.price)}</div><span className={product.stock < 4 ? "text-xs font-bold text-red-600" : "text-xs font-bold text-success"}>{formatNumber(product.stock)} موجود</span><Button className="icon-action" onClick={() => navigate("product", product.id)}><Icon name="arrow" /></Button></div>)}</div></RolePage>;
}

export function AdminTechnicians({ navigate }: { navigate: Navigate }) {
  return <RolePage title="احراز هویت نصاب‌ها" subtitle="بررسی مدارک و مدیریت دسترسی متخصصان"><div className="grid gap-3">{technicians.map((tech, index) => <div className="surface-card" key={tech.id}><div className="flex items-center gap-3"><span className={`avatar avatar-${index + 1}`}><Icon name="user" /></span><div className="flex-1"><div className="font-black">{tech.name}</div><div className="text-xs text-muted">{tech.skill} · {formatNumber(tech.jobs)} پروژه</div></div><span className="status-badge">{tech.status}</span></div><div className="mt-5 flex gap-2 border-t border-line pt-4"><Button className="primary-button h-11 flex-1 justify-center" onClick={() => navigate("admin-dashboard")}>تأیید مدارک</Button><Button className="secondary-button h-11 flex-1 justify-center" onClick={() => navigate("admin-dashboard")}>مشاهده جزئیات</Button></div></div>)}</div></RolePage>;
}

function RolePage({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="page-wrap min-h-screen py-6 sm:py-9"><div className="mb-7"><div className="text-2xl font-black">{title}</div><div className="mt-1 text-sm text-muted">{subtitle}</div></div>{children}</main>;
}

function Stat({ icon, value, label }: { icon: "wallet" | "orders" | "star" | "chart" | "tool" | "users" | "box"; value: string; label: string }) {
  return <div className="stat-card"><span className="stat-icon"><Icon name={icon} /></span><div className="mt-4 truncate text-lg font-black">{value}</div><div className="mt-1 text-xs text-muted">{label}</div></div>;
}

function AdminLink({ label, count, onClick }: { label: string; count: number; onClick: () => void }) {
  return <Button className="menu-row w-full" onClick={onClick}><span>{label}</span><span className="mr-auto rounded-full bg-brand-soft px-2 py-1 text-xs font-black text-brand">{formatNumber(count)}</span><Icon name="arrow" size="sm" /></Button>;
}
