import { useState } from "react";
import { useApp } from "../state";
import type { Role, Screen } from "../types";
import Icon, { type IconName } from "./Icon";
import { Button, formatNumber } from "./ui";

export function Header() {
  const { navigate, screen, cartCount, notifications, user, switchRole } = useApp();
  const unread = notifications.some((item) => item.unread);
  const nav: [string, Screen][] = [["خانه", "home"], ["فروشگاه", "store"], ["خدمات فنی", "service-wizard"], ["نصاب‌ها", "technicians"]];
  return (
    <>
      <div className="no-print bg-ink text-white">
        <div className="page-wrap flex h-10 items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-white/80"><Icon name="shield" size="sm" /><span className="truncate">تضمین اصالت کالا و خدمات توسط متخصصان احراز هویت‌شده</span></div>
          <div className="hidden items-center gap-5 text-white/70 md:flex">
            <Button className="hover:text-white" onClick={() => navigate("orders")}>پیگیری سفارش</Button>
            <Button className="hover:text-white" onClick={() => navigate("support")}>مرکز پشتیبانی</Button>
            <Button className="hover:text-white" onClick={() => switchRole("technician", "onboarding")}>ثبت‌نام نصاب</Button>
          </div>
        </div>
      </div>
      <header className="no-print sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl">
        <div className="page-wrap flex h-20 items-center gap-3 lg:gap-5">
          <Button className="flex shrink-0 items-center gap-3" onClick={() => navigate("home")} label="صفحه اصلی">
            <span className="brand-mark"><Icon name="pump" size="lg" /></span>
            <span className="hidden text-right lg:block"><span className="block text-base font-black leading-none">گروه صنعتی حنیفی</span><span className="mt-1 block text-xs font-bold text-muted">تخصص، کیفیت، اطمینان</span></span>
          </Button>
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map(([label, target]) => <Button key={target} className={`nav-item ${screen === target ? "nav-item-active" : ""}`} onClick={() => navigate(target)}>{label}</Button>)}
          </nav>
          <Button className="search-box mr-auto flex min-w-0 flex-1 items-center gap-3 lg:max-w-sm" onClick={() => navigate("search")} label="جستجو">
            <Icon name="search" /><span className="truncate text-sm text-muted">جستجو در محصولات...</span>
          </Button>
          <Button className="icon-action relative" onClick={() => navigate("notifications")} label="اعلان‌ها"><Icon name="bell" />{unread && <span className="notification-dot" />}</Button>
          <Button className="icon-action relative" onClick={() => navigate("cart")} label="سبد خرید"><Icon name="bag" />{cartCount > 0 && <span className="cart-count">{formatNumber(cartCount)}</span>}</Button>
          <Button className="profile-action hidden items-center gap-2 sm:flex" onClick={() => navigate(user ? "profile" : "login")}><Icon name="user" size="sm" /><span className="max-w-28 truncate">{user ? user.name : "ورود / ثبت‌نام"}</span></Button>
        </div>
      </header>
    </>
  );
}

export function BottomNav() {
  const { screen, navigate, startService } = useApp();
  const items: [string, IconName, Screen, () => void][] = [
    ["خانه", "home", "home", () => navigate("home")],
    ["فروشگاه", "bag", "store", () => navigate("store")],
    ["خدمات", "tool", "service-wizard", () => startService()],
    ["درخواست‌ها", "orders", "my-requests", () => navigate("my-requests")],
    ["حساب من", "user", "profile", () => navigate("profile")],
  ];
  return <nav className="mobile-nav no-print sm:hidden">{items.map(([label, icon, target, go]) => <Button key={target} onClick={go} className={`mobile-nav-item ${screen === target ? "text-brand" : ""}`}><Icon name={icon} /><span>{label}</span></Button>)}</nav>;
}

export function Footer() {
  const { navigate } = useApp();
  const links: [string, () => void][] = [
    ["درباره ما", () => navigate("info", 1)], ["قوانین", () => navigate("info", 2)], ["حریم خصوصی", () => navigate("info", 3)], ["پشتیبانی", () => navigate("support")],
  ];
  return (
    <footer className="footer no-print">
      <div className="page-wrap grid gap-8 py-10 md:grid-cols-4">
        <div className="md:col-span-2"><div className="flex items-center gap-3"><span className="brand-mark"><Icon name="pump" /></span><div className="font-black">گروه فنی صنعتی حنیفی</div></div><div className="mt-4 max-w-md text-sm leading-7 text-white/60">مرجع تخصصی فروش تجهیزات صنعتی و ارائه خدمات نصب و تعمیر توسط متخصصان تأییدشده.</div></div>
        <div><div className="font-extrabold">ارتباط با ما</div><div className="mt-4 space-y-2 text-sm text-white/60"><div>تلفن: ۰۲۱–۴۴۲۲ ۸۱۰۰</div><div>تهران، خیابان آزادی، مجتمع صنعتی حنیفی</div><div>شنبه تا پنجشنبه، ۸ تا ۱۸</div></div></div>
        <div><div className="font-extrabold">دسترسی سریع</div><div className="mt-4 grid grid-cols-2 gap-2 text-sm text-white/60">{links.map(([label, go]) => <Button key={label} className="text-right hover:text-white" onClick={go}>{label}</Button>)}</div><div className="mt-5 flex size-20 items-center justify-center rounded-xl bg-white text-center text-xs font-black text-ink">نماد<br />اعتماد</div></div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">تمام حقوق برای گروه صنعتی حنیفی محفوظ است.</div>
    </footer>
  );
}

export function RoleSwitcher() {
  const { role, switchRole } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <div className={`role-switcher no-print ${open ? "role-switcher-open" : ""}`}>
      <Button className="role-trigger" onClick={() => setOpen((value) => !value)}><Icon name="users" size="sm" />تغییر نقش</Button>
      <div className="role-label">نمایش نمونه</div>
      <div className="role-menu">
        {([["customer", "اپ مشتری"], ["technician", "اپ نصاب"], ["admin", "پنل مدیریت"]] as [Role, string][]).map(([value, label]) => <Button key={value} className={`role-option ${role === value ? "role-option-active" : ""}`} onClick={() => { switchRole(value); setOpen(false); }}>{label}</Button>)}
      </div>
    </div>
  );
}
