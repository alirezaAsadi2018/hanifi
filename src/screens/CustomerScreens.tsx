import { useState } from "react";
import heroImg from "../assets/images/hero.jpg";
import Icon, { type IconName } from "../components/Icon";
import { MapBg } from "../components/MapPicker";
import ProductCard from "../components/ProductCard";
import { Button, formatDecimal, formatNumber, formatPrice, PageHeader } from "../components/ui";
import { categories, extendedTechnicians, products, type Technician } from "../data/mock";
import { useApp } from "../state";

export const statusDot: Record<Technician["status"], string> = { آنلاین: "bg-success", مشغول: "bg-red-500", آفلاین: "bg-faint" };

export function CustomerHome() {
  const { navigate, addToCart, startService } = useApp();
  const online = extendedTechnicians.filter((tech) => tech.status === "آنلاین").length;
  return (
    <main>
      <section className="page-wrap py-5 lg:py-8">
        <div className="hero-grid overflow-hidden">
          <div className="hero-copy">
            <div className="eyebrow"><span className="pulse-dot" /> شبکه تخصصی تجهیزات و خدمات صنعتی</div>
            <h1 className="display-title">خرید مطمئن،<br /><span className="text-brand">خدمات حرفه‌ای</span></h1>
            <div className="mt-4 max-w-xl text-sm leading-7 text-muted lg:text-base">از انتخاب و خرید تجهیزات صنعتی تا نصب و تعمیر؛ متخصصان تأییدشده حنیفی در سریع‌ترین زمان کنار شما هستند.</div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="primary-button" onClick={() => startService()}><Icon name="tool" /><span>درخواست سرویس‌کار</span><Icon name="arrow" size="sm" /></Button>
              <Button className="secondary-button" onClick={() => navigate("store")}><Icon name="bag" /><span>مشاهده فروشگاه</span></Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["نصب", "تعمیر", "عیب‌یابی", "سرویس دوره‌ای"].map((service) => (
                <Button key={service} className="filter-chip" onClick={() => startService({ service })}>{service}</Button>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-xs text-muted">{["ضمانت اصالت", "ارسال سریع", "پشتیبانی تخصصی"].map((item) => <div key={item} className="flex items-center gap-2"><span className="check-badge"><Icon name="check" size="sm" /></span>{item}</div>)}</div>
          </div>
          <div className="hero-visual"><img className="h-full w-full object-cover" src={heroImg} alt="تجهیزات صنعتی در کارخانه" /><div className="hero-overlay" /><div className="floating-stat stat-top"><span className="status-online" /><div><div className="font-extrabold">{formatNumber(28)} متخصص آنلاین</div><div className="mt-1 text-xs text-muted">آماده خدمت در محدوده شما</div></div></div></div>
        </div>
      </section>
      <section className="page-wrap py-5">
        <SectionTitle title="دسته‌بندی محصولات" subtitle="تجهیزات تخصصی برای هر نیاز" action="مشاهده همه" onClick={() => navigate("store")} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => <Button key={category.title} onClick={() => navigate("store", index + 1)} className="category-card text-right"><span className="category-icon"><Icon name={category.icon as IconName} size="lg" /></span><span><span className="block font-extrabold">{category.title}</span><span className="mt-1 block text-xs text-muted">{category.subtitle}</span></span><span className="mr-auto text-faint"><Icon name="arrow" size="sm" /></span></Button>)}
        </div>
      </section>
      <section className="page-wrap py-8">
        <SectionTitle title="پیشنهادهای منتخب" subtitle="محصولات پرفروش با تضمین اصالت حنیفی" action="همه محصولات" onClick={() => navigate("store")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...products].sort((a, b) => b.sold - a.sold).slice(0, 3).map((product) => <ProductCard key={product.id} product={product} onOpen={() => navigate("product", product.id)} onAdd={() => addToCart(product.id)} />)}</div>
      </section>
      <section className="service-band">
        <div className="page-wrap grid gap-8 py-10 lg:grid-cols-2 lg:items-center lg:py-14">
          <div>
            <div className="eyebrow eyebrow-light"><span className="pulse-dot" /> اعزام سریع در محدوده شما</div>
            <div className="mt-4 text-3xl font-black leading-tight text-white">متخصص مطمئن، همین نزدیکی است</div>
            <div className="mt-4 text-sm leading-7 text-white/65">{formatNumber(online)} نصاب احراز هویت‌شده همین حالا در محدوده شما آنلاین هستند.</div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="primary-button" onClick={() => startService()}><Icon name="tool" />ثبت درخواست خدمت</Button>
              <Button className="secondary-button border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white" onClick={() => navigate("technicians")}><Icon name="map" />نصاب‌ها روی نقشه</Button>
            </div>
          </div>
          <div className="technician-panel">
            <div className="mb-4 flex items-center justify-between"><div className="font-black">متخصصان نزدیک شما</div><div className="flex items-center gap-2 text-xs font-bold text-success"><span className="status-online" /> {formatNumber(online)} آنلاین</div></div>
            <div className="space-y-2">
              {extendedTechnicians.slice(0, 3).map((tech, index) => (
                <Button className="technician-row w-full text-right" key={tech.id} onClick={() => navigate("technician-detail", tech.id)}>
                  <span className={`avatar avatar-${index + 1} relative`}><Icon name="user" /><span className={`absolute -bottom-0.5 -left-0.5 size-3 rounded-full ring-2 ring-white ${statusDot[tech.status]}`} /></span>
                  <span className="min-w-0 flex-1"><span className="block font-extrabold">{tech.name}</span><span className="mt-1 block truncate text-xs text-muted">{tech.skill} · {formatNumber(tech.jobs)} پروژه · {tech.status}</span></span>
                  <span className="rating"><Icon name="star" size="sm" /> {formatDecimal(tech.rating)}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="page-wrap py-10">
        <div className="trust-grid">
          {([["shield", "متخصصان احراز هویت‌شده", "بررسی مدارک هویتی و فنی پیش از فعالیت"], ["star", "انتخاب آگاهانه", "امتیاز، سوابق و نظر مشتریان واقعی"], ["lock", "حریم خصوصی شما", "شماره و آدرس دقیق شما فقط پس از پذیرش درخواست"]] as [IconName, string, string][]).map(([icon, title, text]) => (
            <div key={title} className="trust-item"><span className="trust-icon"><Icon name={icon} /></span><div><div className="font-black">{title}</div><div className="mt-1 text-xs leading-6 text-muted">{text}</div></div></div>
          ))}
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ title, subtitle, action, onClick }: { title: string; subtitle: string; action: string; onClick: () => void }) {
  return <div className="section-heading"><div><div className="section-title">{title}</div><div className="section-caption">{subtitle}</div></div><Button className="text-link" onClick={onClick}>{action}<Icon name="arrow" size="sm" /></Button></div>;
}

/** Approximate service zones on the map — never an exact point (privacy requirement). */
export const techZones = [
  { id: 1, x: 42, y: 36, size: 110 },
  { id: 2, x: 68, y: 58, size: 95 },
  { id: 3, x: 24, y: 64, size: 100 },
  { id: 4, x: 58, y: 82, size: 85 },
];

export function TechniciansScreen() {
  const { navigate, back, startService } = useApp();
  const [view, setView] = useState<"map" | "list">("map");
  const [focus, setFocus] = useState<number | null>(null);
  const ordered = [...extendedTechnicians].sort((a, b) => (a.status === "آنلاین" ? 0 : 1) - (b.status === "آنلاین" ? 0 : 1) || a.distance - b.distance);

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <PageHeader title="متخصصان نزدیک شما" subtitle="همه نصاب‌ها پس از احراز هویت و بررسی مدارک فعال شده‌اند" back={back} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-line bg-white p-1">
          {(["map", "list"] as const).map((item) => <Button key={item} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ${view === item ? "bg-brand text-white" : "text-muted"}`} onClick={() => setView(item)}><Icon name={item === "map" ? "map" : "menu"} size="sm" />{item === "map" ? "نقشه" : "فهرست"}</Button>)}
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-bold text-muted">{(["آنلاین", "مشغول", "آفلاین"] as const).map((status) => <span key={status} className="flex items-center gap-1.5"><span className={`size-2.5 rounded-full ${statusDot[status]}`} />{status}</span>)}</div>
      </div>

      {view === "map" && (
        <MapBg className="mb-5 h-72 sm:h-96">
          {techZones.map((zone) => {
            const tech = extendedTechnicians.find((item) => item.id === zone.id)!;
            const active = focus === tech.id;
            return (
              <button key={zone.id} type="button" onClick={() => setFocus(active ? null : tech.id)} aria-label={`محدوده ${tech.name}`}
                className={`tech-zone ${tech.status === "آنلاین" ? "tech-zone-online" : tech.status === "مشغول" ? "tech-zone-busy" : "tech-zone-offline"} ${active ? "ring-4 ring-brand/30" : ""}`}
                style={{ left: `${zone.x}%`, top: `${zone.y}%`, width: zone.size, height: zone.size }}>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-black shadow">{tech.name.split(" ")[0]}</span>
              </button>
            );
          })}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full"><div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-ink text-white shadow-lg"><Icon name="home" size="sm" /></div></div>
          <div className="absolute bottom-3 right-3 max-w-60 rounded-xl bg-white/95 px-3 py-2 text-xs leading-5 text-muted shadow"><b className="text-ink">حریم خصوصی:</b> دایره‌ها محدوده تقریبی فعالیت هستند، نه موقعیت دقیق نصاب.</div>
        </MapBg>
      )}

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {ordered.filter((tech) => focus === null || tech.id === focus).map((tech, index) => (
          <div className={`surface-card ${tech.status === "آفلاین" ? "opacity-70" : ""}`} key={tech.id}>
            <div className="flex items-center gap-3">
              <span className={`avatar avatar-${(index % 3) + 1}`}><Icon name="user" /></span>
              <div className="min-w-0"><div className="truncate font-black">{tech.name}</div><div className="truncate text-xs text-muted">{tech.skill}</div></div>
              <span className="mr-auto flex shrink-0 items-center gap-1.5 text-xs font-bold"><span className={`size-2.5 rounded-full ${statusDot[tech.status]}`} />{tech.status}</span>
            </div>
            <div className="my-5 grid grid-cols-3 gap-2 text-center"><Metric value={formatDecimal(tech.rating)} label="امتیاز" /><Metric value={formatNumber(tech.jobs)} label="پروژه" /><Metric value={`${formatNumber(tech.acceptance)}٪`} label="پذیرش" /></div>
            <div className="mb-4 flex justify-between text-xs text-muted"><span>حدود {formatDecimal(tech.distance)} کیلومتر</span><span className="font-bold text-ink">از {formatPrice(tech.tariffs[0].price)}</span></div>
            <div className="flex gap-2">
              <Button className="secondary-button h-11 flex-1 justify-center text-sm" onClick={() => navigate("technician-detail", tech.id)}>پروفایل</Button>
              <Button className="primary-button h-11 flex-1 justify-center text-sm" disabled={tech.status !== "آنلاین"} onClick={() => startService({ technicianId: tech.id })}>درخواست</Button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="rounded-xl bg-canvas p-3"><div className="truncate font-black">{value}</div><div className="mt-1 text-xs text-muted">{label}</div></div>;
}
