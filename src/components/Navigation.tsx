import { useState } from "react";
import type { Navigate, Role, Screen } from "../types";
import Icon, { type IconName } from "./Icon";
import { Button } from "./ui";

export function Header({ navigate, cartCount, role }: { navigate: Navigate; cartCount: number; role: Role }) {
  const home: Screen = role === "customer" ? "home" : role === "technician" ? "technician-dashboard" : "admin-dashboard";
  return (
    <>
      <div className="bg-ink text-white">
        <div className="page-wrap flex h-10 items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-white/80"><Icon name="shield" size="sm" /><span>تضمین اصالت کالا و خدمات توسط متخصصان احراز هویت‌شده</span></div>
          <div className="hidden items-center gap-5 text-white/70 md:flex">
            <Button onClick={() => navigate("orders")}>پیگیری سفارش</Button>
            <Button onClick={() => navigate("profile")}>مرکز پشتیبانی</Button>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl">
        <div className="page-wrap flex h-20 items-center gap-3 lg:gap-5">
          <Button className="flex shrink-0 items-center gap-3" onClick={() => navigate(home)} label="صفحه اصلی">
            <span className="brand-mark"><Icon name="pump" size="lg" /></span>
            <span className="hidden text-right lg:block"><span className="block text-base font-black leading-none">گروه صنعتی حنیفی</span><span className="mt-1 block text-xs font-bold text-muted">تخصص، کیفیت، اطمینان</span></span>
          </Button>
          {role === "customer" && (
            <div className="hidden items-center gap-1 lg:flex">
              <Button className="nav-item" onClick={() => navigate("home")}>خانه</Button>
              <Button className="nav-item" onClick={() => navigate("store")}>فروشگاه</Button>
              <Button className="nav-item" onClick={() => navigate("service-wizard")}>خدمات فنی</Button>
              <Button className="nav-item" onClick={() => navigate("technicians")}>نصاب‌ها</Button>
            </div>
          )}
          <Button className="search-box mr-auto flex min-w-0 flex-1 items-center gap-3 lg:max-w-sm" onClick={() => navigate("search")} label="جستجو">
            <Icon name="search" /><span className="truncate text-sm text-muted">جستجو در محصولات و خدمات...</span>
          </Button>
          <Button className="icon-action relative" onClick={() => navigate("notifications")} label="اعلان‌ها"><Icon name="bell" /><span className="notification-dot" /></Button>
          {role === "customer" && <Button className="icon-action relative" onClick={() => navigate("cart")} label="سبد خرید"><Icon name="bag" />{cartCount > 0 && <span className="cart-count">{cartCount.toLocaleString("fa-IR")}</span>}</Button>}
          <Button className="profile-action hidden items-center gap-2 sm:flex" onClick={() => navigate(role === "technician" ? "technician-profile" : "profile")}><Icon name="user" size="sm" /><span>حساب کاربری</span></Button>
        </div>
      </header>
    </>
  );
}

export function BottomNav({ screen, navigate }: { screen: Screen; navigate: Navigate }) {
  const items: [string, IconName, Screen][] = [
    ["خانه", "home", "home"], ["فروشگاه", "bag", "store"], ["خدمات", "tool", "service-wizard"], ["درخواست‌ها", "orders", "my-requests"], ["حساب من", "user", "profile"],
  ];
  return <nav className="mobile-nav sm:hidden">{items.map(([label, icon, target]) => <Button key={target} onClick={() => navigate(target)} className={`mobile-nav-item ${screen === target ? "text-brand" : ""}`}><Icon name={icon} /><span>{label}</span></Button>)}</nav>;
}

export function Footer({ navigate }: { navigate: Navigate }) {
  return (
    <footer className="footer">
      <div className="page-wrap grid gap-8 py-10 md:grid-cols-4">
        <div className="md:col-span-2"><div className="flex items-center gap-3"><span className="brand-mark"><Icon name="pump" /></span><div className="font-black">گروه فنی صنعتی حنیفی</div></div><div className="mt-4 max-w-md text-sm leading-7 text-white/60">مرجع تخصصی فروش تجهیزات صنعتی و ارائه خدمات نصب و تعمیر توسط متخصصان تأییدشده.</div></div>
        <div><div className="font-extrabold">ارتباط با ما</div><div className="mt-4 space-y-2 text-sm text-white/60"><div>تلفن: ۰۲۱–۴۴۲۲ ۸۱۰۰</div><div>تهران، خیابان آزادی، مجتمع صنعتی حنیفی</div><div>شنبه تا پنجشنبه، ۸ تا ۱۸</div></div></div>
        <div><div className="font-extrabold">دسترسی سریع</div><div className="mt-4 grid grid-cols-2 gap-2 text-sm text-white/60">{["درباره ما", "قوانین", "حریم خصوصی", "پشتیبانی"].map((item) => <Button key={item} className="text-right hover:text-white" onClick={() => navigate("profile")}>{item}</Button>)}</div><div className="mt-5 flex size-20 items-center justify-center rounded-xl bg-white text-center text-xs font-black text-ink">نماد<br />اعتماد</div></div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">تمام حقوق برای گروه صنعتی حنیفی محفوظ است.</div>
    </footer>
  );
}

export function RoleSwitcher({ role, onChange }: { role: Role; onChange: (role: Role) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`role-switcher ${open ? "role-switcher-open" : ""}`}>
      <Button className="role-trigger" onClick={() => setOpen((value) => !value)}><Icon name="users" size="sm" />تغییر نقش</Button>
      <div className="role-label">نمایش نمونه</div>
      <div className="role-menu">
        {([["customer", "اپ مشتری"], ["technician", "اپ نصاب"], ["admin", "پنل مدیریت"]] as [Role, string][]).map(([value, label]) => <Button key={value} className={`role-option ${role === value ? "role-option-active" : ""}`} onClick={() => { onChange(value); setOpen(false); }}>{label}</Button>)}
      </div>
    </div>
  );
}
