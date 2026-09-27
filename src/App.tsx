import { useMemo, useState } from "react";

type IconName =
  | "search"
  | "pin"
  | "bell"
  | "bag"
  | "user"
  | "arrow"
  | "shield"
  | "tool"
  | "check"
  | "star"
  | "clock"
  | "close"
  | "pump"
  | "motor"
  | "gear"
  | "parts"
  | "home"
  | "orders"
  | "support";

const iconPaths: Record<IconName, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  pin: <><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
  bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
  arrow: <><path d="M19 12H5M11 6l-6 6 6 6" /></>,
  shield: <><path d="M12 22s8-3.8 8-11V5l-8-3-8 3v6c0 7.2 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  tool: <><path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 8.4 7.2 6.1 4.9a4 4 0 0 0 5 5L19 18a2 2 0 0 1-3 3l-7.8-7.9" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  star: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3Z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  pump: <><circle cx="10" cy="12" r="5" /><path d="M15 10h5v8h-5M5 16v3h10M10 7V4h5" /></>,
  motor: <><path d="M5 7h12v11H5zM17 10h3v5h-3M2 10h3v5H2" /><path d="M8 4h6v3M8 21h6" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>,
  parts: <><path d="M4 7h16M7 7v10M17 7v10M4 17h16" /><circle cx="7" cy="12" r="2" /><circle cx="17" cy="12" r="2" /></>,
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
  orders: <><path d="M5 4h14v17H5zM8 8h8M8 12h8M8 16h5" /></>,
  support: <><circle cx="12" cy="12" r="9" /><path d="M8 14v-3a4 4 0 0 1 8 0v3M6 12h2v4H6zM16 12h2v4h-2z" /></>,
};

function Icon({ name, size = "md" }: { name: IconName; size?: "sm" | "md" | "lg" }) {
  return (
    <svg
      className={size === "sm" ? "size-4" : size === "lg" ? "size-7" : "size-5"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

function Action({
  children,
  className = "",
  onClick,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      className={`cursor-pointer select-none transition-all duration-200 active:scale-95 ${className}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && onClick) onClick();
      }}
    >
      {children}
    </div>
  );
}

const categories = [
  { title: "پمپ آب", subtitle: "خانگی و صنعتی", icon: "pump" as IconName },
  { title: "الکتروموتور", subtitle: "تک‌فاز و سه‌فاز", icon: "motor" as IconName },
  { title: "گیربکس", subtitle: "حلزونی و صنعتی", icon: "gear" as IconName },
  { title: "متعلقات", subtitle: "قطعات و تجهیزات", icon: "parts" as IconName },
];

const products = [
  {
    name: "پمپ آب جتی پنتاکس",
    model: "CAM 100 — یک اسب",
    price: "۸,۴۵۰,۰۰۰",
    oldPrice: "۹,۲۰۰,۰۰۰",
    badge: "پرفروش",
    image: "https://images.unsplash.com/photo-1700318092011-6e4666e94ab5?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "الکتروموتور موتوژن",
    model: "سه فاز — ۳ کیلووات",
    price: "۱۲,۸۰۰,۰۰۰",
    oldPrice: "",
    badge: "موجود",
    image: "https://images.unsplash.com/photo-1674471361339-f720c171ec77?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "بوستر پمپ آبرسانی",
    model: "دو پمپه — کنترل هوشمند",
    price: "۴۶,۵۰۰,۰۰۰",
    oldPrice: "۴۹,۰۰۰,۰۰۰",
    badge: "ویژه",
    image: "https://images.unsplash.com/photo-1738918929491-3c102ce11c8a?auto=format&fit=crop&w=700&q=85",
  },
];

const technicians = [
  { name: "علیرضا صادقی", skill: "نصب و تعمیر پمپ", rating: "۴.۹", jobs: "۱۲۶ پروژه", area: "۲.۴ کیلومتر" },
  { name: "مهدی کریمی", skill: "برق صنعتی و موتور", rating: "۴.۸", jobs: "۹۸ پروژه", area: "۳.۱ کیلومتر" },
  { name: "امیرحسین رحمانی", skill: "بوستر پمپ", rating: "۴.۷", jobs: "۷۴ پروژه", area: "۴.۶ کیلومتر" },
];

function App() {
  const [activeNav, setActiveNav] = useState("خانه");
  const [activeCategory, setActiveCategory] = useState("همه");
  const [showRequest, setShowRequest] = useState(false);
  const [requestStep, setRequestStep] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [notice, setNotice] = useState("");

  const serviceTypes = useMemo(() => ["نصب", "تعمیر", "عیب‌یابی", "سرویس دوره‌ای"], []);

  const addToCart = () => {
    setCartCount((count) => count + 1);
    setNotice("محصول به سبد خرید اضافه شد");
    window.setTimeout(() => setNotice(""), 2200);
  };

  const startRequest = () => {
    setRequestStep(1);
    setShowRequest(true);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink" dir="rtl">
      <div className="bg-ink text-white">
        <div className="page-wrap flex h-10 items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-white/80">
            <Icon name="shield" size="sm" />
            <span>تضمین اصالت کالا و خدمات توسط متخصصان احراز هویت‌شده</span>
          </div>
          <div className="hidden items-center gap-5 text-white/70 md:flex">
            <span>پیگیری سفارش</span>
            <span>مرکز پشتیبانی</span>
            <span>همکاری با ما</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-xl">
        <div className="page-wrap flex h-20 items-center gap-5">
          <Action className="flex shrink-0 items-center gap-3" onClick={() => setActiveNav("خانه")} label="صفحه اصلی">
            <div className="brand-mark"><Icon name="pump" size="lg" /></div>
            <div className="hidden lg:block">
              <div className="text-base font-black leading-none">گروه صنعتی حنیفی</div>
              <div className="mt-1 text-xs font-bold tracking-wide text-muted">تخصص، کیفیت، اطمینان</div>
            </div>
          </Action>

          <div className="hidden items-center gap-1 lg:flex">
            {["خانه", "فروشگاه", "خدمات فنی", "نصاب‌ها"].map((item) => (
              <Action
                key={item}
                onClick={() => setActiveNav(item)}
                className={`nav-item ${activeNav === item ? "nav-item-active" : ""}`}
              >
                {item}
              </Action>
            ))}
          </div>

          <Action className="search-box mr-auto flex min-w-0 flex-1 items-center gap-3 lg:max-w-sm" label="جستجو">
            <Icon name="search" />
            <span className="truncate text-sm text-muted">جستجو در محصولات و خدمات...</span>
          </Action>

          <Action className="location-pill hidden items-center gap-2 xl:flex">
            <Icon name="pin" size="sm" />
            <span>تهران، منطقه ۲</span>
          </Action>
          <Action className="icon-action relative" label="اعلان‌ها">
            <Icon name="bell" />
            <span className="notification-dot" />
          </Action>
          <Action className="icon-action relative" label="سبد خرید">
            <Icon name="bag" />
            {cartCount > 0 && <span className="cart-count">{cartCount.toLocaleString("fa-IR")}</span>}
          </Action>
          <Action className="profile-action hidden items-center gap-2 sm:flex">
            <Icon name="user" size="sm" />
            <span>ورود / ثبت‌نام</span>
          </Action>
        </div>
      </header>

      <main>
        <section className="page-wrap py-6 lg:py-8">
          <div className="hero-grid overflow-hidden">
            <div className="hero-copy">
              <div className="eyebrow"><span className="pulse-dot" /> شبکه تخصصی تجهیزات و خدمات صنعتی</div>
              <div className="display-title">
                خرید مطمئن،
                <br />
                <span className="text-brand">خدمات حرفه‌ای</span>
              </div>
              <div className="mt-5 max-w-xl text-sm leading-7 text-muted lg:text-base lg:leading-8">
                از انتخاب و خرید تجهیزات صنعتی تا نصب و تعمیر؛ متخصصان تأیید‌شده حنیفی در سریع‌ترین زمان کنار شما هستند.
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Action className="primary-button" onClick={startRequest}>
                  <Icon name="tool" />
                  <span>درخواست سرویس‌کار</span>
                  <Icon name="arrow" size="sm" />
                </Action>
                <Action className="secondary-button" onClick={() => setActiveNav("فروشگاه")}>
                  <Icon name="bag" />
                  <span>مشاهده فروشگاه</span>
                </Action>
              </div>
              <div className="mt-9 flex items-center gap-7 text-xs text-muted">
                <div className="flex items-center gap-2"><span className="check-badge"><Icon name="check" size="sm" /></span> ضمانت اصالت</div>
                <div className="flex items-center gap-2"><span className="check-badge"><Icon name="check" size="sm" /></span> ارسال سریع</div>
                <div className="hidden items-center gap-2 sm:flex"><span className="check-badge"><Icon name="check" size="sm" /></span> پشتیبانی تخصصی</div>
              </div>
            </div>

            <div className="hero-visual">
              <img
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1655874837055-7adc909ae602?auto=format&fit=crop&w=1200&q=88"
                alt="تجهیزات صنعتی در کارخانه"
              />
              <div className="hero-overlay" />
              <div className="floating-stat stat-top">
                <span className="status-online" />
                <div><div className="font-extrabold">۲۸ متخصص آنلاین</div><div className="mt-1 text-xs text-muted">آماده خدمت در محدوده شما</div></div>
              </div>
              <div className="floating-stat stat-bottom">
                <span className="stat-icon"><Icon name="shield" /></span>
                <div><div className="font-extrabold">خرید با خیال راحت</div><div className="mt-1 text-xs text-muted">ضمانت اصالت تجهیزات</div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-wrap pb-5">
          <div className="section-heading">
            <div>
              <div className="section-title">دسته‌بندی محصولات</div>
              <div className="section-caption">تجهیزات تخصصی برای هر نیاز</div>
            </div>
            <Action className="text-link">مشاهده همه <Icon name="arrow" size="sm" /></Action>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Action
                key={category.title}
                onClick={() => setActiveCategory(category.title)}
                className={`category-card ${activeCategory === category.title ? "category-card-active" : ""}`}
              >
                <span className="category-icon"><Icon name={category.icon} size="lg" /></span>
                <span>
                  <span className="block font-extrabold">{category.title}</span>
                  <span className="mt-1 block text-xs text-muted">{category.subtitle}</span>
                </span>
                <span className="mr-auto text-faint"><Icon name="arrow" size="sm" /></span>
              </Action>
            ))}
          </div>
        </section>

        <section className="page-wrap py-8">
          <div className="section-heading">
            <div>
              <div className="section-title">پیشنهادهای منتخب</div>
              <div className="section-caption">محصولات پرفروش با تضمین اصالت حنیفی</div>
            </div>
            <Action className="text-link">همه محصولات <Icon name="arrow" size="sm" /></Action>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {products.map((product) => (
              <div className="product-card" key={product.name}>
                <div className="product-image-wrap">
                  <img className="product-image" src={product.image} alt={product.name} />
                  <span className="product-badge">{product.badge}</span>
                </div>
                <div className="p-5">
                  <div className="text-xs font-bold text-brand">فروش مستقیم گروه حنیفی</div>
                  <div className="mt-2 font-black">{product.name}</div>
                  <div className="mt-1 text-xs text-muted">{product.model}</div>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      {product.oldPrice && <div className="text-xs text-faint line-through">{product.oldPrice}</div>}
                      <div className="mt-1 text-lg font-black">{product.price} <span className="text-xs font-medium text-muted">تومان</span></div>
                    </div>
                    <Action className="add-button" onClick={addToCart} label={`افزودن ${product.name} به سبد`}>
                      <Icon name="bag" />
                    </Action>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="service-band">
          <div className="page-wrap grid gap-8 py-10 lg:grid-cols-2 lg:items-center lg:py-14">
            <div>
              <div className="eyebrow eyebrow-light"><span className="pulse-dot" /> اعزام سریع در محدوده شما</div>
              <div className="mt-4 text-3xl font-black leading-tight text-white lg:text-4xl">متخصص مطمئن، همین نزدیکی است</div>
              <div className="mt-4 max-w-lg text-sm leading-7 text-white/65">نوع خدمت را انتخاب کنید تا نزدیک‌ترین نصاب‌های احراز هویت‌شده و آنلاین را به شما نمایش دهیم.</div>
              <div className="mt-6 flex flex-wrap gap-2">
                {serviceTypes.map((item) => <Action key={item} className="service-chip" onClick={startRequest}>{item}</Action>)}
              </div>
            </div>
            <div className="technician-panel">
              <div className="mb-4 flex items-center justify-between">
                <div className="font-black">متخصصان نزدیک شما</div>
                <div className="flex items-center gap-2 text-xs font-bold text-success"><span className="status-online" /> آنلاین</div>
              </div>
              <div className="space-y-2">
                {technicians.map((tech, index) => (
                  <div className="technician-row" key={tech.name}>
                    <div className={`avatar avatar-${index + 1}`}><Icon name="user" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold">{tech.name}</div>
                      <div className="mt-1 truncate text-xs text-muted">{tech.skill} · {tech.jobs}</div>
                    </div>
                    <div className="hidden items-center gap-1 text-xs font-bold text-muted sm:flex"><Icon name="pin" size="sm" /> {tech.area}</div>
                    <div className="rating"><Icon name="star" size="sm" /> {tech.rating}</div>
                  </div>
                ))}
              </div>
              <Action className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand-soft py-3 text-sm font-extrabold text-brand" onClick={startRequest}>
                مشاهده روی نقشه و ثبت درخواست
                <Icon name="arrow" size="sm" />
              </Action>
            </div>
          </div>
        </section>

        <section className="page-wrap py-10 lg:py-14">
          <div className="trust-grid">
            <div className="trust-item"><span className="trust-icon"><Icon name="shield" /></span><div><div className="font-black">متخصصان احراز هویت‌شده</div><div className="mt-1 text-xs leading-6 text-muted">بررسی مدارک هویتی و فنی پیش از فعالیت</div></div></div>
            <div className="trust-item"><span className="trust-icon"><Icon name="star" /></span><div><div className="font-black">انتخاب آگاهانه</div><div className="mt-1 text-xs leading-6 text-muted">امتیاز، سوابق و نظر مشتریان واقعی</div></div></div>
            <div className="trust-item"><span className="trust-icon"><Icon name="support" /></span><div><div className="font-black">پشتیبانی از ابتدا تا پایان</div><div className="mt-1 text-xs leading-6 text-muted">پیگیری سفارش و درخواست خدمت در یک پنل</div></div></div>
          </div>
        </section>
      </main>

      <nav className="mobile-nav md:hidden">
        {[
          ["خانه", "home"],
          ["فروشگاه", "bag"],
          ["درخواست خدمت", "tool"],
          ["سفارش‌ها", "orders"],
          ["حساب من", "user"],
        ].map(([label, icon]) => (
          <Action
            key={label}
            onClick={() => label === "درخواست خدمت" ? startRequest() : setActiveNav(label)}
            className={`mobile-nav-item ${activeNav === label ? "text-brand" : ""}`}
          >
            <Icon name={icon as IconName} />
            <span>{label}</span>
          </Action>
        ))}
      </nav>

      {showRequest && (
        <div className="modal-backdrop" onClick={() => setShowRequest(false)}>
          <div className="request-modal" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xl font-black">ثبت درخواست خدمت</div>
                <div className="mt-2 text-sm text-muted">در کمتر از دو دقیقه، متخصص مناسب را پیدا کنید.</div>
              </div>
              <Action className="icon-action" onClick={() => setShowRequest(false)} label="بستن"><Icon name="close" /></Action>
            </div>
            <div className="my-6 flex gap-2">
              {[1, 2, 3].map((step) => <span key={step} className={`step-bar ${requestStep >= step ? "step-bar-active" : ""}`} />)}
            </div>
            {requestStep === 1 && (
              <div>
                <div className="mb-4 font-extrabold">به چه خدمتی نیاز دارید؟</div>
                <div className="grid grid-cols-2 gap-3">
                  {serviceTypes.map((item) => (
                    <Action key={item} className="service-option" onClick={() => setRequestStep(2)}>
                      <span className="category-icon"><Icon name="tool" /></span>
                      <span className="font-extrabold">{item}</span>
                    </Action>
                  ))}
                </div>
              </div>
            )}
            {requestStep === 2 && (
              <div>
                <div className="mb-4 font-extrabold">دستگاه مورد نظر را انتخاب کنید</div>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((item) => <Action key={item.title} className="service-option" onClick={() => setRequestStep(3)}><span className="category-icon"><Icon name={item.icon} /></span><span className="font-extrabold">{item.title}</span></Action>)}
                </div>
              </div>
            )}
            {requestStep === 3 && (
              <div className="text-center">
                <span className="success-mark"><Icon name="check" size="lg" /></span>
                <div className="mt-4 text-xl font-black">درخواست شما آماده ثبت است</div>
                <div className="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted">موقعیت شما تهران، منطقه ۲ در نظر گرفته شد. ۲۸ متخصص آنلاین در محدوده حضور دارند.</div>
                <Action className="primary-button mt-6 justify-center" onClick={() => { setShowRequest(false); setNotice("درخواست با موفقیت ثبت شد"); window.setTimeout(() => setNotice(""), 2500); }}>
                  ثبت و ارسال برای متخصصان
                </Action>
              </div>
            )}
          </div>
        </div>
      )}

      {notice && <div className="toast"><span className="check-badge"><Icon name="check" size="sm" /></span>{notice}</div>}
    </div>
  );
}

export default App;
