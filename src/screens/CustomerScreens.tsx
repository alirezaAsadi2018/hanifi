import { useMemo, useState } from "react";
import { categories, notifications, orders, products, reviews, technicians, type Product } from "../data/mock";
import type { Navigate } from "../types";
import Icon, { type IconName } from "../components/Icon";
import ProductCard from "../components/ProductCard";
import { Button, formatNumber, formatPrice, Modal } from "../components/ui";

type CommonProps = { navigate: Navigate; addToCart: (id: number) => void };

export function CustomerHome({ navigate, addToCart, onQuickService }: CommonProps & { onQuickService?: (service: string) => void }) {
  return (
    <main>
      <section className="page-wrap py-5 lg:py-8">
        <div className="hero-grid overflow-hidden">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pulse-dot" /> شبکه تخصصی تجهیزات و خدمات صنعتی</div>
            <div className="display-title">خرید مطمئن،<br /><span className="text-brand">خدمات حرفه‌ای</span></div>
            <div className="mt-4 max-w-xl text-sm leading-7 text-muted lg:text-base">از انتخاب و خرید تجهیزات صنعتی تا نصب و تعمیر؛ متخصصان تأییدشده حنیفی در سریع‌ترین زمان کنار شما هستند.</div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="primary-button" onClick={() => navigate("service-wizard")}><Icon name="tool" /><span>درخواست سرویس‌کار</span><Icon name="arrow" size="sm" /></Button>
              <Button className="secondary-button" onClick={() => navigate("store")}><Icon name="bag" /><span>مشاهده فروشگاه</span></Button>
            </div>
            {onQuickService && (
              <div className="mt-4 flex flex-wrap gap-2">
                {["نصب", "تعمیر", "عیب‌یابی", "سرویس دوره‌ای"].map((s) => (
                  <Button key={s} className="filter-chip" onClick={() => onQuickService(s)}>{s}</Button>
                ))}
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-5 text-xs text-muted">{["ضمانت اصالت", "ارسال سریع", "پشتیبانی تخصصی"].map((item) => <div key={item} className="flex items-center gap-2"><span className="check-badge"><Icon name="check" size="sm" /></span>{item}</div>)}</div>
          </div>
          <div className="hero-visual"><img className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1655874837055-7adc909ae602?auto=format&fit=crop&w=1200&q=88" alt="تجهیزات صنعتی در کارخانه" /><div className="hero-overlay" /><div className="floating-stat stat-top"><span className="status-online" /><div><div className="font-extrabold">{formatNumber(28)} متخصص آنلاین</div><div className="mt-1 text-xs text-muted">آماده خدمت در محدوده شما</div></div></div></div>
        </div>
      </section>
      <section className="page-wrap py-5">
        <SectionTitle title="دسته‌بندی محصولات" subtitle="تجهیزات تخصصی برای هر نیاز" action="مشاهده همه" onClick={() => navigate("store")} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => <Button key={category.title} onClick={() => navigate("store")} className="category-card text-right"><span className="category-icon"><Icon name={category.icon as IconName} size="lg" /></span><span><span className="block font-extrabold">{category.title}</span><span className="mt-1 block text-xs text-muted">{category.subtitle}</span></span><span className="mr-auto text-faint"><Icon name="arrow" size="sm" /></span></Button>)}
        </div>
      </section>
      <section className="page-wrap py-8">
        <SectionTitle title="پیشنهادهای منتخب" subtitle="محصولات پرفروش با تضمین اصالت حنیفی" action="همه محصولات" onClick={() => navigate("store")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} onOpen={() => navigate("product", product.id)} onAdd={() => addToCart(product.id)} />)}</div>
      </section>
      <section className="service-band">
        <div className="page-wrap grid gap-8 py-10 lg:grid-cols-2 lg:items-center lg:py-14">
          <div><div className="eyebrow eyebrow-light"><span className="pulse-dot" /> اعزام سریع در محدوده شما</div><div className="mt-4 text-3xl font-black leading-tight text-white">متخصص مطمئن، همین نزدیکی است</div><div className="mt-4 text-sm leading-7 text-white/65">نزدیک‌ترین نصاب‌های احراز هویت‌شده و آنلاین را پیدا کنید.</div><Button className="primary-button mt-6" onClick={() => navigate("technicians")}>مشاهده متخصصان<Icon name="arrow" /></Button><Button className="secondary-button mt-3 border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white" onClick={() => navigate("service-wizard")}><Icon name="tool" />ثبت درخواست سریع</Button></div>
          <TechnicianList navigate={navigate} />
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ title, subtitle, action, onClick }: { title: string; subtitle: string; action: string; onClick: () => void }) {
  return <div className="section-heading"><div><div className="section-title">{title}</div><div className="section-caption">{subtitle}</div></div><Button className="text-link" onClick={onClick}>{action}<Icon name="arrow" size="sm" /></Button></div>;
}

export function StoreScreen({ navigate, addToCart }: CommonProps) {
  const [category, setCategory] = useState("همه");
  const filtered = category === "همه" ? products : products.filter((item) => item.category === category);
  return <Page title="فروشگاه تجهیزات" subtitle="محصولات اصل با ضمانت گروه صنعتی حنیفی" back={() => navigate("home")}>
    <div className="mb-5 flex gap-2 overflow-x-auto pb-2">{["همه", ...categories.map((item) => item.title)].map((item) => <Button key={item} onClick={() => setCategory(item)} className={`filter-chip ${category === item ? "filter-chip-active" : ""}`}>{item}</Button>)}</div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((product) => <ProductCard key={product.id} product={product} onOpen={() => navigate("product", product.id)} onAdd={() => addToCart(product.id)} />)}</div>
  </Page>;
}

export function ProductScreen({ product, navigate, addToCart }: CommonProps & { product: Product }) {
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  return <Page title="جزئیات محصول" subtitle="بررسی مشخصات و خرید مستقیم" back={() => navigate("store")}>
    <div className="grid gap-6 rounded-3xl border border-line bg-white p-4 md:grid-cols-2 md:p-7">
      <div className="relative overflow-hidden rounded-2xl bg-canvas"><img className="h-full min-h-72 w-full object-cover" src={product.image} alt={product.name} />{discount > 0 && <span className="discount-badge">{formatNumber(discount)}٪ تخفیف</span>}</div>
      <div className="flex flex-col justify-center"><div className="text-xs font-bold text-brand">{product.category} · ضمانت اصالت</div><div className="mt-3 text-2xl font-black">{product.name}</div><div className="mt-2 text-sm text-muted">{product.model}</div><div className="mt-5 text-sm leading-7 text-muted">{product.description}</div><div className="my-5 rounded-2xl bg-brand-soft p-4 text-sm font-bold text-brand">موجود در انبار: {formatNumber(product.stock)} دستگاه</div>{product.oldPrice && <div className="old-price">{formatPrice(product.oldPrice)}</div>}<div className="mt-1 text-2xl font-black">{formatPrice(product.price)}</div><Button className="primary-button mt-6 justify-center" onClick={() => addToCart(product.id)}><Icon name="bag" />افزودن به سبد خرید</Button></div>
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-3">{["مشخصات فنی تأییدشده", "ارسال سریع و مطمئن", "امکان نصب توسط متخصص"].map((item) => <div key={item} className="info-card"><span className="check-badge"><Icon name="check" size="sm" /></span><span>{item}</span></div>)}</div>
  </Page>;
}

export function ServiceScreen({ navigate }: { navigate: Navigate }) {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const services = ["نصب", "تعمیر", "عیب‌یابی", "سرویس دوره‌ای"];
  return <Page title="ثبت درخواست خدمت" subtitle="مرحله‌به‌مرحله تا اعزام متخصص" back={() => navigate("home")}>
    <div className="mx-auto max-w-2xl rounded-3xl border border-line bg-white p-5 sm:p-8">
      <div className="mb-7 flex gap-2">{[1, 2, 3].map((item) => <span key={item} className={`step-bar ${step >= item ? "step-bar-active" : ""}`} />)}</div>
      {done ? <div className="py-10 text-center"><span className="success-mark"><Icon name="check" size="lg" /></span><div className="mt-4 text-xl font-black">درخواست با موفقیت ثبت شد</div><div className="mt-2 text-sm text-muted">درخواست برای متخصصان آنلاین محدوده ارسال شد.</div><Button className="primary-button mx-auto mt-6" onClick={() => navigate("orders")}>پیگیری درخواست</Button></div> : <>
        {step === 1 && <Choice title="نوع خدمت را انتخاب کنید" items={services} icon="tool" onChoose={() => setStep(2)} />}
        {step === 2 && <Choice title="نوع دستگاه را انتخاب کنید" items={categories.map((item) => item.title)} icon="pump" onChoose={() => setStep(3)} />}
        {step === 3 && <div><div className="font-extrabold">جزئیات و زمان مراجعه</div><label className="form-label">شرح مشکل<textarea className="form-field min-h-28" placeholder="مشکل دستگاه را کوتاه توضیح دهید..." /></label><label className="form-label">زمان پیشنهادی<select className="form-field"><option>امروز، ساعت ۱۷ تا ۲۰</option><option>فردا، ساعت ۹ تا ۱۲</option></select></label><Button className="primary-button mt-5 w-full justify-center" onClick={() => setDone(true)}>ثبت و ارسال درخواست</Button></div>}
      </>}
    </div>
  </Page>;
}

function Choice({ title, items, icon, onChoose }: { title: string; items: string[]; icon: IconName; onChoose: () => void }) {
  return <div><div className="mb-4 font-extrabold">{title}</div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{items.map((item) => <Button key={item} className="service-option text-right" onClick={onChoose}><span className="category-icon"><Icon name={icon} /></span><span className="font-extrabold">{item}</span></Button>)}</div></div>;
}

function TechnicianList({ navigate }: { navigate: Navigate }) {
  return <div className="technician-panel"><div className="mb-4 flex items-center justify-between"><div className="font-black">متخصصان نزدیک شما</div><div className="flex items-center gap-2 text-xs font-bold text-success"><span className="status-online" /> آنلاین</div></div><div className="space-y-2">{technicians.map((tech, index) => <Button className="technician-row w-full text-right" key={tech.id} onClick={() => navigate("technician-detail", tech.id)}><span className={`avatar avatar-${index + 1}`}><Icon name="user" /></span><span className="min-w-0 flex-1"><span className="block font-extrabold">{tech.name}</span><span className="mt-1 block truncate text-xs text-muted">{tech.skill} · {formatNumber(tech.jobs)} پروژه</span></span><span className="rating"><Icon name="star" size="sm" /> {tech.rating.toLocaleString("fa-IR")}</span></Button>)}</div></div>;
}

export function TechniciansScreen({ navigate }: { navigate: Navigate }) {
  return <Page title="متخصصان نزدیک شما" subtitle="همه افراد پس از احراز هویت و بررسی مدارک فعال شده‌اند" back={() => navigate("home")}><div className="mb-5 flex h-48 items-center justify-center rounded-3xl bg-brand-soft text-center text-brand"><div><Icon name="pin" size="lg" /><div className="mt-2 font-black">نقشه محدوده فعالیت</div><div className="mt-1 text-xs">موقعیت دقیق برای حفظ حریم خصوصی نمایش داده نمی‌شود.</div></div></div><div className="grid gap-4 lg:grid-cols-3">{technicians.map((tech, index) => <div className="surface-card" key={tech.id}><div className="flex items-center gap-3"><span className={`avatar avatar-${index + 1}`}><Icon name="user" /></span><div><div className="font-black">{tech.name}</div><div className="text-xs text-muted">{tech.skill}</div></div><span className="mr-auto status-online" /></div><div className="my-5 grid grid-cols-3 gap-2 text-center"><Metric value={tech.rating.toLocaleString("fa-IR")} label="امتیاز" /><Metric value={formatNumber(tech.jobs)} label="پروژه" /><Metric value={`${formatNumber(tech.acceptance)}٪`} label="پذیرش" /></div><div className="flex gap-2"><Button className="secondary-button flex-1 justify-center text-sm" onClick={() => navigate("technician-detail", tech.id)}>پروفایل</Button><Button className="primary-button flex-1 justify-center text-sm" onClick={() => navigate("service-wizard")}>درخواست</Button></div></div>)}</div></Page>;
}

export function CartScreen({ cart, changeQuantity, navigate }: { cart: number[]; changeQuantity: (id: number, add: boolean) => void; navigate: Navigate }) {
  const grouped = cart.reduce<Record<number, number>>((acc, id) => ({ ...acc, [id]: (acc[id] || 0) + 1 }), {});
  const rows = Object.entries(grouped).map(([id, quantity]) => ({ product: products.find((item) => item.id === Number(id))!, quantity }));
  const total = rows.reduce((sum, row) => sum + row.product.price * row.quantity, 0);
  return <Page title="سبد خرید" subtitle={`${formatNumber(cart.length)} کالا در سبد شما`} back={() => navigate("store")}><div className="grid gap-5 lg:grid-cols-3"><div className="space-y-3 lg:col-span-2">{rows.length ? rows.map(({ product, quantity }) => <div className="cart-row" key={product.id}><img className="size-20 rounded-xl object-cover" src={product.image} alt={product.name} /><div className="min-w-0 flex-1"><div className="font-black">{product.name}</div><div className="mt-1 text-xs text-muted">{formatPrice(product.price)}</div></div><div className="quantity"><Button onClick={() => changeQuantity(product.id, true)} label="افزایش"><Icon name="plus" size="sm" /></Button><span>{formatNumber(quantity)}</span><Button onClick={() => changeQuantity(product.id, false)} label="کاهش"><Icon name={quantity === 1 ? "trash" : "minus"} size="sm" /></Button></div></div>) : <Empty text="سبد خرید شما خالی است" action="رفتن به فروشگاه" onClick={() => navigate("store")} />}</div>{rows.length > 0 && <div className="surface-card h-fit"><div className="font-black">خلاصه سفارش</div><div className="my-5 flex justify-between text-sm text-muted"><span>مبلغ کالاها</span><span>{formatPrice(total)}</span></div><div className="flex justify-between border-t border-line pt-4 font-black"><span>مبلغ قابل پرداخت</span><span>{formatPrice(total)}</span></div><Button className="primary-button mt-6 w-full justify-center" onClick={() => navigate("orders")}>ادامه و پرداخت</Button></div>}</div></Page>;
}

export function OrdersScreen({ navigate }: { navigate: Navigate }) {
  return <Page title="سفارش‌ها و درخواست‌ها" subtitle="همه خریدها و خدمات شما در یک‌جا" back={() => navigate("home")}><div className="space-y-3">{orders.map((order) => <div className="surface-card" key={order.id}><div className="flex items-center justify-between"><div className="font-black">سفارش شماره {formatNumber(order.id)}</div><span className="status-badge">{order.status}</span></div><div className="mt-4 grid grid-cols-3 gap-2 text-sm"><Metric value={order.date} label="تاریخ" /><Metric value={formatNumber(order.items)} label="تعداد کالا" /><Metric value={formatPrice(order.total)} label="مبلغ" /></div><Button className="secondary-button mt-5 w-full justify-center" onClick={() => navigate("notifications")}>مشاهده وضعیت سفارش</Button></div>)}</div></Page>;
}

export function NotificationsScreen({ navigate }: { navigate: Navigate }) {
  return <Page title="اعلان‌ها" subtitle={`${formatNumber(notifications.filter((item) => item.unread).length)} اعلان خوانده‌نشده`} back={() => navigate("home")}><div className="space-y-3">{notifications.map((item) => <Button key={item.id} className={`notification-row w-full text-right ${item.unread ? "notification-unread" : ""}`} onClick={() => navigate("orders")}><span className="stat-icon"><Icon name="bell" /></span><span className="flex-1"><span className="block font-black">{item.title}</span><span className="mt-1 block text-sm text-muted">{item.text}</span><span className="mt-2 block text-xs text-faint">{item.time}</span></span></Button>)}</div></Page>;
}

export function ProfileScreen({ navigate }: { navigate: Navigate }) {
  const menuItems: [string, () => void][] = [
    ["درخواست‌های خدمت من", () => navigate("my-requests")],
    ["سفارش‌های خرید من", () => navigate("orders")],
    ["ویرایش اطلاعات حساب", () => navigate("orders")],
    ["آدرس‌های من", () => navigate("orders")],
    ["روش‌های پرداخت", () => navigate("orders")],
    ["پشتیبانی و تماس با ما", () => navigate("orders")],
  ];
  return <Page title="حساب کاربری" subtitle="مدیریت اطلاعات و پشتیبانی" back={() => navigate("home")}><div className="grid gap-5 md:grid-cols-3"><div className="surface-card text-center"><span className="avatar avatar-1 mx-auto size-16"><Icon name="user" size="lg" /></span><div className="mt-3 font-black">سارا محمدی</div><div className="mt-1 text-xs text-muted">۰۹۱۲۱۲۳۴۵۶۷</div></div><div className="surface-card space-y-1 md:col-span-2">{menuItems.map(([label, onClick]) => <Button key={label} className="menu-row" onClick={onClick}><span>{label}</span><Icon name="arrow" /></Button>)}</div></div></Page>;
}

export function SearchScreen({ navigate, addToCart }: CommonProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => products.filter((item) => item.name.includes(query) || item.category.includes(query)), [query]);
  return <Page title="جستجو" subtitle="نام محصول یا دسته‌بندی را وارد کنید" back={() => navigate("home")}><label className="search-input"><Icon name="search" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="برای مثال: پمپ آب" /></label>{query ? <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{results.map((product) => <ProductCard key={product.id} product={product} onOpen={() => navigate("product", product.id)} onAdd={() => addToCart(product.id)} />)}</div> : <div className="mt-8"><div className="mb-3 text-sm font-black">جستجوهای پیشنهادی</div><div className="flex flex-wrap gap-2">{categories.map((item) => <Button className="filter-chip" key={item.title} onClick={() => setQuery(item.title)}>{item.title}</Button>)}</div></div>}</Page>;
}

export function ReviewsBlock() {
  return <div className="space-y-3">{reviews.map((review) => <div className="surface-card" key={review.id}><div className="flex justify-between"><div className="font-black">{review.author}</div><div className="rating"><Icon name="star" size="sm" />{formatNumber(review.rating)}</div></div><div className="mt-3 text-sm leading-7 text-muted">{review.text}</div><div className="mt-2 text-xs text-faint">{review.date}</div></div>)}</div>;
}

function Page({ title, subtitle, back, children }: { title: string; subtitle: string; back: () => void; children: React.ReactNode }) {
  return <main className="page-wrap min-h-screen py-6 sm:py-9"><div className="mb-6 flex items-center gap-3"><Button className="icon-action" onClick={back} label="بازگشت"><Icon name="arrow" /></Button><div><div className="text-xl font-black sm:text-2xl">{title}</div><div className="mt-1 text-xs text-muted sm:text-sm">{subtitle}</div></div></div>{children}</main>;
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="rounded-xl bg-canvas p-3"><div className="truncate font-black">{value}</div><div className="mt-1 text-xs text-muted">{label}</div></div>;
}

function Empty({ text, action, onClick }: { text: string; action: string; onClick: () => void }) {
  return <div className="surface-card py-12 text-center"><span className="success-mark"><Icon name="bag" /></span><div className="mt-4 font-black">{text}</div><Button className="primary-button mx-auto mt-5" onClick={onClick}>{action}</Button></div>;
}

export function ServiceQuickModal({ open, close, navigate }: { open: boolean; close: () => void; navigate: Navigate }) {
  return <Modal open={open} onClose={close} title="درخواست سریع خدمت"><div className="mt-6 grid grid-cols-2 gap-3">{["نصب", "تعمیر", "عیب‌یابی", "سرویس"].map((item) => <Button key={item} className="service-option" onClick={() => { close(); navigate("service"); }}><Icon name="tool" />{item}</Button>)}</div></Modal>;
}
