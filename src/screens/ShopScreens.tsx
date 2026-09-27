import { useMemo, useState } from "react";
import AddressForm from "../components/AddressForm";
import Icon from "../components/Icon";
import ProductCard from "../components/ProductCard";
import { Button, ConfirmDialog, EmptyState, formatDecimal, formatNumber, formatPrice, Modal, PageHeader, Tabs, Toggle, formatId } from "../components/ui";
import {
  brands, categories, initialAddresses, orderStatusColor, orderStatusLabel, productReviews, products, shippingMethods,
  type Order, type OrderStatus, type Product,
} from "../data/mock";
import { checkCoupon, linesToItems, orderTotals } from "../lib/pricing";
import { useApp } from "../state";

// ─────────────────────────────────────────────
// Store: filters + sort
// ─────────────────────────────────────────────

const priceRanges = [
  { key: "lt5", label: "زیر ۵ میلیون", test: (p: number) => p < 5_000_000 },
  { key: "5-15", label: "۵ تا ۱۵ میلیون", test: (p: number) => p >= 5_000_000 && p < 15_000_000 },
  { key: "15-30", label: "۱۵ تا ۳۰ میلیون", test: (p: number) => p >= 15_000_000 && p < 30_000_000 },
  { key: "gt30", label: "بالای ۳۰ میلیون", test: (p: number) => p >= 30_000_000 },
];

const powerRanges = [
  { key: "lt1", label: "تا ۱ اسب", test: (hp: number) => hp > 0 && hp <= 1 },
  { key: "1-2", label: "۱ تا ۲ اسب", test: (hp: number) => hp > 1 && hp <= 2 },
  { key: "gt2", label: "بالای ۲ اسب", test: (hp: number) => hp > 2 },
];

const sorts = [
  { key: "best", label: "پرفروش‌ترین", fn: (a: Product, b: Product) => b.sold - a.sold },
  { key: "cheap", label: "ارزان‌ترین", fn: (a: Product, b: Product) => a.price - b.price },
  { key: "expensive", label: "گران‌ترین", fn: (a: Product, b: Product) => b.price - a.price },
  { key: "new", label: "جدیدترین", fn: (a: Product, b: Product) => b.addedOrder - a.addedOrder },
] as const;

type Filters = { category: string; brands: string[]; price: string; power: string; phase: string; inStock: boolean };
const emptyFilters: Filters = { category: "همه", brands: [], price: "", power: "", phase: "", inStock: false };

function applyFilters(list: Product[], f: Filters) {
  return list.filter((p) =>
    (f.category === "همه" || p.category === f.category) &&
    (!f.brands.length || f.brands.includes(p.brand)) &&
    (!f.price || priceRanges.find((r) => r.key === f.price)!.test(p.price)) &&
    (!f.power || powerRanges.find((r) => r.key === f.power)!.test(p.power)) &&
    (!f.phase || p.phase === f.phase) &&
    (!f.inStock || p.stock > 0),
  );
}

function FilterPanel({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters({ ...filters, [key]: value });
  const chips = (items: { key: string; label: string }[], key: "price" | "power" | "phase") => (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Button key={item.key} className={`filter-chip px-3 text-xs ${filters[key] === item.key ? "filter-chip-active" : ""}`} onClick={() => set(key, filters[key] === item.key ? "" : item.key)}>{item.label}</Button>
      ))}
    </div>
  );
  return (
    <div className="space-y-6">
      <div>
        <div className="filter-title">دسته‌بندی</div>
        <div className="flex flex-wrap gap-2">
          {["همه", ...categories.map((c) => c.title)].map((item) => (
            <Button key={item} className={`filter-chip px-3 text-xs ${filters.category === item ? "filter-chip-active" : ""}`} onClick={() => set("category", item)}>{item}</Button>
          ))}
        </div>
      </div>
      <div>
        <div className="filter-title">برند</div>
        <div className="space-y-1">
          {brands.map((brand) => {
            const on = filters.brands.includes(brand);
            return (
              <Button key={brand} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-right text-sm font-bold hover:bg-canvas" onClick={() => set("brands", on ? filters.brands.filter((b) => b !== brand) : [...filters.brands, brand])}>
                <span className={`checkbox ${on ? "checkbox-on" : ""}`}>{on && <Icon name="check" size="sm" />}</span>{brand}
                <span className="mr-auto text-xs text-faint">{formatNumber(products.filter((p) => p.brand === brand).length)}</span>
              </Button>
            );
          })}
        </div>
      </div>
      <div><div className="filter-title">محدوده قیمت</div>{chips(priceRanges, "price")}</div>
      <div><div className="filter-title">توان</div>{chips(powerRanges, "power")}</div>
      <div><div className="filter-title">نوع برق</div>{chips([{ key: "تک‌فاز", label: "تک‌فاز" }, { key: "سه‌فاز", label: "سه‌فاز" }], "phase")}</div>
      <div className="flex items-center justify-between rounded-2xl bg-canvas p-3 text-sm font-bold">
        فقط کالاهای موجود
        <Toggle checked={filters.inStock} onChange={(value) => set("inStock", value)} label="فقط کالاهای موجود" />
      </div>
    </div>
  );
}

export function StoreScreen() {
  const { navigate, back, addToCart, param } = useApp();
  const [filters, setFilters] = useState<Filters>({ ...emptyFilters, category: param ? categories[param - 1]?.title ?? "همه" : "همه" });
  const [sort, setSort] = useState<(typeof sorts)[number]["key"]>("best");
  const [sheet, setSheet] = useState(false);

  const result = useMemo(() => applyFilters(products, filters).sort(sorts.find((s) => s.key === sort)!.fn), [filters, sort]);
  const activeCount = (filters.category !== "همه" ? 1 : 0) + filters.brands.length + [filters.price, filters.power, filters.phase].filter(Boolean).length + (filters.inStock ? 1 : 0);

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <PageHeader title="فروشگاه تجهیزات" subtitle="محصولات اصل با ضمانت گروه صنعتی حنیفی" back={back} />
      <Button className="search-box mb-5 flex w-full items-center gap-3" onClick={() => navigate("search")}><Icon name="search" /><span className="text-sm text-muted">جستجو در محصولات...</span></Button>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="surface-card sticky top-24">
            <div className="mb-5 flex items-center justify-between"><div className="font-black">فیلترها</div>{activeCount > 0 && <Button className="text-xs font-bold text-red-600" onClick={() => setFilters(emptyFilters)}>حذف همه</Button>}</div>
            <FilterPanel filters={filters} setFilters={setFilters} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex items-center gap-2">
            <Button className="filter-chip flex items-center gap-2 lg:hidden" onClick={() => setSheet(true)}>
              <Icon name="filter" size="sm" />فیلترها{activeCount > 0 && <span className="tab-count">{formatNumber(activeCount)}</span>}
            </Button>
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1">
              <span className="hidden shrink-0 text-xs font-bold text-muted sm:inline">مرتب‌سازی:</span>
              {sorts.map((item) => (
                <Button key={item.key} className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold ${sort === item.key ? "bg-brand-soft text-brand" : "text-muted hover:text-ink"}`} onClick={() => setSort(item.key)}>{item.label}</Button>
              ))}
            </div>
            <span className="hidden shrink-0 text-xs text-muted sm:inline">{formatNumber(result.length)} کالا</span>
          </div>

          {result.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.map((product) => <ProductCard key={product.id} product={product} onOpen={() => navigate("product", product.id)} onAdd={() => addToCart(product.id)} />)}
            </div>
          ) : (
            <EmptyState icon="search" text="کالایی با این فیلترها پیدا نشد" hint="چند فیلتر را بردارید یا محدوده قیمت را بزرگ‌تر کنید." action="حذف همه فیلترها" onClick={() => setFilters(emptyFilters)} />
          )}
        </div>
      </div>

      <Modal open={sheet} onClose={() => setSheet(false)} title="فیلترها" subtitle={`${formatNumber(result.length)} کالا با فیلترهای فعلی`}>
        <div className="mt-5"><FilterPanel filters={filters} setFilters={setFilters} /></div>
        <div className="sticky bottom-0 mt-6 flex gap-2 bg-white pt-3">
          <Button className="primary-button flex-1 justify-center" onClick={() => setSheet(false)}>نمایش {formatNumber(result.length)} کالا</Button>
          <Button className="secondary-button px-5" onClick={() => setFilters(emptyFilters)}>حذف</Button>
        </div>
      </Modal>
    </main>
  );
}

// ─────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────

export function SearchScreen() {
  const { navigate, back, addToCart } = useApp();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(["پمپ جتی", "الکتروموتور سه‌فاز", "منبع تحت فشار"]);
  const q = query.trim();
  const results = useMemo(
    () => (q ? products.filter((p) => [p.name, p.brand, p.category, p.model].some((field) => field.includes(q))) : []),
    [q],
  );
  const remember = (term: string) => setRecent((list) => [term, ...list.filter((item) => item !== term)].slice(0, 6));

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <PageHeader title="جستجو" subtitle="نام محصول، برند یا دسته‌بندی را وارد کنید" back={back} />
      <label className="search-input">
        <Icon name="search" />
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && q && remember(q)} placeholder="برای مثال: پمپ آب" />
        {query && <Button className="text-muted" onClick={() => setQuery("")} label="پاک کردن"><Icon name="close" size="sm" /></Button>}
      </label>

      {q ? (
        results.length ? (
          <>
            <div className="mb-3 mt-6 text-sm text-muted">{formatNumber(results.length)} نتیجه برای «{q}»</div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((product) => <ProductCard key={product.id} product={product} onOpen={() => { remember(q); navigate("product", product.id); }} onAdd={() => addToCart(product.id)} />)}
            </div>
          </>
        ) : (
          <div className="mt-6"><EmptyState icon="search" text={`نتیجه‌ای برای «${q}» پیدا نشد`} hint="املای کلمه را بررسی کنید یا عبارت کلی‌تری مثل «پمپ» جستجو کنید." /></div>
        )
      ) : (
        <div className="mt-8 space-y-7">
          {recent.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between"><div className="text-sm font-black">جستجوهای اخیر</div><Button className="text-xs font-bold text-red-600" onClick={() => setRecent([])}>پاک کردن</Button></div>
              <div className="flex flex-wrap gap-2">{recent.map((item) => <Button key={item} className="filter-chip flex items-center gap-2" onClick={() => setQuery(item)}><Icon name="clock" size="sm" />{item}</Button>)}</div>
            </div>
          )}
          <div>
            <div className="mb-3 text-sm font-black">دسته‌بندی‌ها</div>
            <div className="flex flex-wrap gap-2">{categories.map((item) => <Button className="filter-chip" key={item.title} onClick={() => setQuery(item.title)}>{item.title}</Button>)}</div>
          </div>
        </div>
      )}
    </main>
  );
}

// ─────────────────────────────────────────────
// Product page
// ─────────────────────────────────────────────

export function ProductScreen() {
  const { navigate, back, addToCart, param, startService, toast } = useApp();
  const product = products.find((item) => item.id === param) ?? products[0];
  const [image, setImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [notify, setNotify] = useState(false);
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const reviews = productReviews.filter((review) => review.productId === product.id);
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3);
  const stock =
    product.stock === 0 ? { text: "ناموجود", cls: "bg-canvas text-muted" }
    : product.stock <= 3 ? { text: `فقط ${formatNumber(product.stock)} عدد باقی مانده`, cls: "bg-red-50 text-red-600" }
    : { text: "موجود در انبار", cls: "bg-green-50 text-green-700" };

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9" key={product.id}>
      <PageHeader title={product.name} subtitle={`${product.category} · ${product.brand}`} back={back} />

      <div className="grid gap-6 rounded-3xl border border-line bg-white p-4 md:grid-cols-2 md:p-7">
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-canvas">
            <img className={`aspect-[4/3] w-full object-cover ${product.stock === 0 ? "grayscale" : ""}`} src={product.gallery[image]} alt={product.name} />
            {discount > 0 && <span className="discount-badge">{formatNumber(discount)}٪ تخفیف</span>}
          </div>
          {product.gallery.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.gallery.map((src, index) => (
                <Button key={src + index} className={`size-16 overflow-hidden rounded-xl border-2 ${image === index ? "border-brand" : "border-transparent opacity-70"}`} onClick={() => setImage(index)} label={`تصویر ${formatNumber(index + 1)}`}>
                  <img src={src} alt="" className="size-full object-cover" />
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-brand">{product.brand}</span><span className="text-faint">·</span>
            <span className="text-muted">{product.model}</span>
            <span className="mr-auto flex items-center gap-1 font-bold text-amber-600">★ {formatDecimal(product.rating)} <span className="font-normal text-muted">({formatNumber(product.reviewCount)} نظر)</span></span>
          </div>
          <div className="mt-3 text-2xl font-black">{product.name}</div>
          <div className="mt-4 text-sm leading-7 text-muted">{product.description}</div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {product.specs.slice(0, 4).map((spec) => <div key={spec.label} className="rounded-xl bg-canvas p-3"><div className="text-muted">{spec.label}</div><div className="mt-1 font-black">{spec.value}</div></div>)}
          </div>
          <div className={`mt-4 w-fit rounded-xl px-3 py-2 text-sm font-bold ${stock.cls}`}>{stock.text}</div>

          <div className="mt-auto pt-5">
            {product.stock > 0 ? (
              <>
                {product.oldPrice && <div className="old-price">{formatPrice(product.oldPrice)}</div>}
                <div className="mt-1 text-2xl font-black">{formatPrice(product.price)}</div>
                <div className="mt-5 flex gap-3">
                  <div className="quantity">
                    <Button onClick={() => setQty(Math.min(qty + 1, product.stock))} label="افزایش" disabled={qty >= product.stock}><Icon name="plus" size="sm" /></Button>
                    <span className="w-6 text-center">{formatNumber(qty)}</span>
                    <Button onClick={() => setQty(Math.max(1, qty - 1))} label="کاهش" disabled={qty <= 1}><Icon name="minus" size="sm" /></Button>
                  </div>
                  <Button className="primary-button flex-1 justify-center" onClick={() => addToCart(product.id, qty)}><Icon name="bag" />افزودن به سبد</Button>
                </div>
              </>
            ) : (
              <Button className={`${notify ? "secondary-button" : "primary-button"} w-full justify-center`} onClick={() => { setNotify(!notify); toast(notify ? "اطلاع‌رسانی لغو شد" : "به محض موجود شدن، پیامک می‌گیرید"); }}>
                <Icon name="bell" />{notify ? "در فهرست اطلاع‌رسانی هستید" : "موجود شد خبرم کن"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="cross-sell mt-5">
        <span className="category-icon bg-white/15 text-white"><Icon name="tool" /></span>
        <div className="min-w-0 flex-1"><div className="font-black">نیاز به نصب دارید؟</div><div className="mt-1 text-sm text-white/70">نصاب‌های احراز هویت‌شده حنیفی این دستگاه را نصب و راه‌اندازی می‌کنند.</div></div>
        <Button className="shrink-0 rounded-2xl bg-white px-4 py-3 text-sm font-black text-brand" onClick={() => startService({ service: "نصب", device: product.category })}>درخواست نصاب</Button>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="surface-card lg:col-span-2">
          <div className="mb-4 font-black">مشخصات فنی</div>
          <table className="spec-table">
            <tbody>{product.specs.map((spec) => <tr key={spec.label}><th>{spec.label}</th><td>{spec.value}</td></tr>)}<tr><th>برند</th><td>{product.brand}</td></tr><tr><th>مدل</th><td>{product.model}</td></tr></tbody>
          </table>
        </div>
        <div className="surface-card">
          <div className="mb-4 flex items-center justify-between"><div className="font-black">نظرات خریداران</div><span className="rating">★ {formatDecimal(product.rating)}</span></div>
          {reviews.length ? (
            <div className="space-y-4">{reviews.map((review) => (
              <div key={review.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between text-sm"><span className="font-bold">{review.author}</span><span className="text-xs text-amber-600">{"★".repeat(review.rating)}</span></div>
                <div className="mt-2 text-sm leading-7 text-muted">{review.text}</div>
                <div className="mt-1 text-xs text-faint">{review.date} · خریدار</div>
              </div>
            ))}</div>
          ) : <div className="text-sm text-muted">هنوز نظری ثبت نشده است. پس از خرید می‌توانید اولین نظر را بنویسید.</div>}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-8">
          <div className="section-title mb-4">محصولات مرتبط</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <ProductCard key={item.id} product={item} onOpen={() => navigate("product", item.id)} onAdd={() => addToCart(item.id)} />)}</div>
        </section>
      )}
    </main>
  );
}

// ─────────────────────────────────────────────
// Cart
// ─────────────────────────────────────────────

export function CartScreen() {
  const { cart, setQty, navigate, back, couponCode, setCouponCode, requireLogin } = useApp();
  const [codeInput, setCodeInput] = useState(couponCode);
  const [codeError, setCodeError] = useState("");
  const items = linesToItems(cart);
  const base = orderTotals(items, 0, 0);
  const coupon = couponCode ? checkCoupon(couponCode, base.subtotal) : null;
  const totals = orderTotals(items, coupon?.amount ?? 0, 0);

  const apply = () => {
    const result = checkCoupon(codeInput, base.subtotal);
    if (result.error) { setCodeError(result.error); setCouponCode(""); }
    else { setCodeError(""); setCouponCode(result.coupon!.code); }
  };

  if (!cart.length) {
    return <main className="page-wrap min-h-screen py-6 sm:py-9"><PageHeader title="سبد خرید" back={back} /><EmptyState icon="bag" text="سبد خرید شما خالی است" hint="محصولات مورد نیازتان را از فروشگاه انتخاب کنید." action="رفتن به فروشگاه" onClick={() => navigate("store")} /></main>;
  }

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <PageHeader title="سبد خرید" subtitle={`${formatNumber(cart.reduce((s, l) => s + l.qty, 0))} کالا در سبد شما`} back={back} />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {cart.map((line) => {
            const product = products.find((item) => item.id === line.productId)!;
            return (
              <div className="cart-row" key={line.productId}>
                <Button onClick={() => navigate("product", product.id)} label={product.name}><img className="size-20 rounded-xl object-cover" src={product.image} alt="" /></Button>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-black">{product.name}</div>
                  <div className="mt-1 text-xs text-muted">{product.model}</div>
                  <div className="mt-2 text-sm font-black">{formatPrice(product.price * line.qty)}</div>
                  {line.qty >= product.stock && <div className="mt-1 text-xs font-bold text-amber-700">حداکثر موجودی انبار</div>}
                </div>
                <div className="quantity">
                  <Button onClick={() => setQty(product.id, line.qty + 1)} label="افزایش" disabled={line.qty >= product.stock}><Icon name="plus" size="sm" /></Button>
                  <span>{formatNumber(line.qty)}</span>
                  <Button onClick={() => setQty(product.id, line.qty - 1)} label={line.qty === 1 ? "حذف" : "کاهش"}><Icon name={line.qty === 1 ? "trash" : "minus"} size="sm" /></Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="surface-card">
            <div className="mb-3 flex items-center gap-2 font-black"><Icon name="percent" size="sm" />کد تخفیف</div>
            {couponCode && coupon && !coupon.error ? (
              <div className="flex items-center gap-2 rounded-2xl border border-brand/30 bg-brand-soft p-3 text-sm">
                <Icon name="check" size="sm" /><span className="font-black text-brand">{couponCode}</span><span className="text-xs text-muted">اعمال شد</span>
                <Button className="mr-auto text-xs font-bold text-red-600" onClick={() => { setCouponCode(""); setCodeInput(""); }}>حذف</Button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input className={`form-field mt-0 flex-1 uppercase ${codeError ? "border-red-300" : ""}`} dir="ltr" placeholder="HANIFI10" value={codeInput} onChange={(event) => { setCodeInput(event.target.value); setCodeError(""); }} onKeyDown={(event) => event.key === "Enter" && apply()} />
                  <Button className="secondary-button h-auto px-4" disabled={!codeInput.trim()} onClick={apply}>اعمال</Button>
                </div>
                {codeError && <div className="mt-2 text-xs font-bold text-red-600">{codeError}</div>}
                <div className="mt-2 text-xs text-faint">کدهای نمونه: HANIFI10 یا WELCOME</div>
              </>
            )}
          </div>

          <div className="surface-card">
            <div className="font-black">خلاصه سفارش</div>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="مبلغ کالاها" value={formatPrice(totals.subtotal + totals.productSavings)} />
              {totals.productSavings > 0 && <Row label="سود شما از تخفیف کالاها" value={`− ${formatPrice(totals.productSavings)}`} accent />}
              {totals.discount > 0 && <Row label={`کد تخفیف ${couponCode}`} value={`− ${formatPrice(totals.discount)}`} accent />}
              <Row label="هزینه ارسال" value="در مرحله بعد" />
            </div>
            <div className="mt-4 flex justify-between border-t border-line pt-4 font-black"><span>جمع قابل پرداخت</span><span>{formatPrice(totals.total)}</span></div>
            <Button className="primary-button mt-5 w-full justify-center" onClick={() => requireLogin("checkout") && navigate("checkout")}>ادامه فرایند خرید<Icon name="arrow" size="sm" /></Button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className={`flex justify-between gap-3 ${accent ? "font-bold text-green-700" : "text-muted"}`}><span>{label}</span><span className="shrink-0">{value}</span></div>;
}

// ─────────────────────────────────────────────
// Checkout
// ─────────────────────────────────────────────

export function CheckoutScreen() {
  const { cart, back, navigate, addresses, couponCode, placeOrder, startPayment } = useApp();
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? 0);
  const [shippingId, setShippingId] = useState(shippingMethods[0].id);
  const [adding, setAdding] = useState(false);
  const items = linesToItems(cart);
  const subtotal = orderTotals(items, 0, 0).subtotal;
  const discount = couponCode ? checkCoupon(couponCode, subtotal).amount : 0;
  const shipping = shippingMethods.find((method) => method.id === shippingId)!;
  const totals = orderTotals(items, discount, shipping.cost);

  if (!cart.length) return <main className="page-wrap min-h-screen py-6 sm:py-9"><PageHeader title="تکمیل خرید" back={back} /><EmptyState icon="bag" text="سبد خرید خالی است" action="رفتن به فروشگاه" onClick={() => navigate("store")} /></main>;

  const pay = () => {
    const order = placeOrder(addressId, shippingId);
    startPayment({ kind: "order", amount: orderTotals(order.items, order.discount, order.shippingCost).total, orderId: order.id });
  };

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <PageHeader title="تکمیل خرید" subtitle="آدرس، روش ارسال و پرداخت" back={back} />
      <div className="checkout-steps mb-6">{["سبد خرید", "آدرس و ارسال", "پرداخت"].map((label, i) => <span key={label} className={i <= 1 ? "text-brand" : ""}><b>{formatNumber(i + 1)}</b>{label}</span>)}</div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="surface-card">
            <div className="mb-4 flex items-center justify-between"><div className="font-black">آدرس تحویل</div><Button className="text-link" onClick={() => setAdding(true)}><Icon name="plus" size="sm" />آدرس جدید</Button></div>
            <div className="space-y-2">
              {addresses.map((address) => (
                <Button key={address.id} className={`radio-row items-start ${addressId === address.id ? "radio-row-active" : ""}`} onClick={() => setAddressId(address.id)}>
                  <span className="radio-dot mt-1">{addressId === address.id && <span />}</span>
                  <span className="min-w-0 flex-1"><span className="block font-black">{address.label}</span><span className="mt-1 block text-xs leading-6 text-muted">{address.detail}</span><span className="mt-1 block text-xs text-faint">{address.receiver} · {address.phone}</span></span>
                </Button>
              ))}
              {!addresses.length && <div className="text-sm text-muted">هنوز آدرسی ثبت نکرده‌اید.</div>}
            </div>
          </div>
          <div className="surface-card">
            <div className="mb-4 font-black">روش ارسال</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {shippingMethods.map((method) => (
                <Button key={method.id} className={`radio-row items-start ${shippingId === method.id ? "radio-row-active" : ""}`} onClick={() => setShippingId(method.id)}>
                  <span className="radio-dot mt-1">{shippingId === method.id && <span />}</span>
                  <span className="min-w-0 flex-1"><span className="block font-black">{method.title}</span><span className="mt-1 block text-xs text-muted">{method.detail}</span></span>
                  <span className="shrink-0 text-xs font-black">{method.cost ? formatPrice(method.cost) : method.id === "freight" ? "پس‌کرایه" : "رایگان"}</span>
                </Button>
              ))}
            </div>
          </div>
          <div className="surface-card">
            <div className="mb-4 font-black">کالاها</div>
            <div className="flex flex-wrap gap-3">{cart.map((line) => { const product = products.find((p) => p.id === line.productId)!; return <div key={line.productId} className="relative"><img src={product.image} alt={product.name} className="size-16 rounded-xl object-cover" /><span className="absolute -left-1 -top-1 flex size-5 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">{formatNumber(line.qty)}</span></div>; })}</div>
          </div>
        </div>

        <div className="surface-card h-fit lg:sticky lg:top-24">
          <div className="font-black">صورت‌حساب</div>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="مبلغ کالاها" value={formatPrice(totals.subtotal)} />
            {totals.discount > 0 && <Row label={`کد تخفیف ${couponCode}`} value={`− ${formatPrice(totals.discount)}`} accent />}
            <Row label="هزینه ارسال" value={shipping.cost ? formatPrice(shipping.cost) : "رایگان"} />
            <Row label="مالیات بر ارزش افزوده (شامل)" value={formatPrice(totals.vat)} />
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-black"><span>مبلغ نهایی</span><span className="text-brand">{formatPrice(totals.total)}</span></div>
          <Button className="primary-button mt-5 w-full justify-center" disabled={!addressId} onClick={pay}><Icon name="lock" />پرداخت آنلاین</Button>
          <div className="mt-3 text-center text-xs text-muted">پرداخت از طریق درگاه امن شاپرک</div>
        </div>
      </div>
      {adding && <AddressForm open={adding} onClose={() => setAdding(false)} onSaved={(address) => setAddressId(address.id)} />}
    </main>
  );
}

export function CheckoutResultScreen({ success }: { success: boolean }) {
  const { navigate, param, orders, startPayment } = useApp();
  const order = orders.find((item) => item.id === param);
  const total = order ? orderTotals(order.items, order.discount, order.shippingCost).total : 0;
  return (
    <main className="page-wrap flex min-h-screen items-center justify-center py-10">
      <div className="mx-auto max-w-sm text-center">
        <div className={`mx-auto mb-5 flex size-24 items-center justify-center rounded-full ${success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"}`}><Icon name={success ? "check" : "close"} size="lg" /></div>
        <div className="text-2xl font-black">{success ? "سفارش شما ثبت شد" : "پرداخت ناموفق"}</div>
        <div className="mt-3 text-sm leading-7 text-muted">
          {success ? <>سفارش شماره {formatId(order?.id ?? 0)} پرداخت شد و در حال آماده‌سازی است.<br />کد پیگیری پرداخت: {order?.paymentRef}</>
            : <>سفارش {formatId(order?.id ?? 0)} با وضعیت «در انتظار پرداخت» ذخیره شد.<br />اگر مبلغی از حساب شما کم شده، تا ۷۲ ساعت برمی‌گردد.</>}
        </div>
        <div className="mt-8 space-y-3">
          {success ? (
            <Button className="primary-button w-full justify-center" onClick={() => navigate("order-detail", order?.id)}>پیگیری سفارش</Button>
          ) : (
            <Button className="primary-button w-full justify-center" onClick={() => order && startPayment({ kind: "order", amount: total, orderId: order.id })}>تلاش مجدد برای پرداخت</Button>
          )}
          <Button className="secondary-button w-full justify-center" onClick={() => navigate(success ? "store" : "orders")}>{success ? "ادامه خرید" : "مشاهده سفارش‌ها"}</Button>
        </div>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────

type OrderTab = "all" | "current" | "delivered" | "cancelled";
const tabStatuses: Record<OrderTab, OrderStatus[]> = {
  all: ["pending-payment", "processing", "shipped", "delivered", "cancelled"],
  current: ["pending-payment", "processing", "shipped"],
  delivered: ["delivered"],
  cancelled: ["cancelled"],
};

export function OrdersScreen() {
  const { orders, navigate, back } = useApp();
  const [tab, setTab] = useState<OrderTab>("current");
  const list = orders.filter((order) => tabStatuses[tab].includes(order.status));
  const count = (key: OrderTab) => orders.filter((order) => tabStatuses[key].includes(order.status)).length;

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <PageHeader title="سفارش‌های من" subtitle="پیگیری خریدهای فروشگاه" back={back} />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: "current", label: "جاری", count: count("current") }, { key: "delivered", label: "تحویل شده" }, { key: "cancelled", label: "لغو شده" }, { key: "all", label: "همه" }]} />
      <div className="mt-5 space-y-3">
        {list.length ? list.map((order) => <OrderCard key={order.id} order={order} onOpen={() => navigate("order-detail", order.id)} />)
          : <EmptyState icon="orders" text="سفارشی در این بخش نیست" action="رفتن به فروشگاه" onClick={() => navigate("store")} />}
      </div>
    </main>
  );
}

function OrderCard({ order, onOpen }: { order: Order; onOpen: () => void }) {
  const total = orderTotals(order.items, order.discount, order.shippingCost).total;
  return (
    <Button className="surface-card block w-full text-right hover:border-brand/30" onClick={onOpen}>
      <div className="flex items-center justify-between gap-3">
        <div><div className="font-black">سفارش {formatId(order.id)}</div><div className="mt-1 text-xs text-muted">{order.date}</div></div>
        <span className={`status-pill ${orderStatusColor[order.status]}`}>{orderStatusLabel[order.status]}</span>
      </div>
      <div className="mt-4 flex items-center gap-2">
        {order.items.map((item) => { const product = products.find((p) => p.id === item.productId)!; return <img key={item.productId} src={product.image} alt={product.name} className="size-12 rounded-xl object-cover" />; })}
        <div className="mr-auto text-left"><div className="text-xs text-muted">مبلغ کل</div><div className="font-black">{formatPrice(total)}</div></div>
      </div>
      {order.status === "pending-payment" && <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">پرداخت انجام نشده؛ سفارش تا ۲۴ ساعت نگه داشته می‌شود.</div>}
    </Button>
  );
}

const orderSteps: { status: OrderStatus | "placed"; label: string }[] = [
  { status: "placed", label: "ثبت سفارش" },
  { status: "processing", label: "پرداخت و پردازش" },
  { status: "shipped", label: "تحویل به شرکت حمل" },
  { status: "delivered", label: "تحویل به مشتری" },
];
const stepIndex: Record<OrderStatus, number> = { "pending-payment": 0, processing: 1, shipped: 2, delivered: 3, cancelled: -1 };

export function OrderDetailScreen() {
  const { orders, param, back, navigate, updateOrder, startPayment, startService, toast, addresses } = useApp();
  const [cancelOpen, setCancelOpen] = useState(false);
  const order = orders.find((item) => item.id === param);
  if (!order) return <main className="page-wrap min-h-screen py-6"><EmptyState icon="orders" text="سفارش پیدا نشد" action="سفارش‌های من" onClick={() => navigate("orders")} /></main>;

  const totals = orderTotals(order.items, order.discount, order.shippingCost);
  const address = addresses.find((item) => item.id === order.addressId) ?? initialAddresses[0];
  const shipping = shippingMethods.find((method) => method.id === order.shippingId)!;
  const current = stepIndex[order.status];
  const hasDevice = order.items.some((item) => ["پمپ آب", "الکتروموتور", "گیربکس"].includes(products.find((p) => p.id === item.productId)!.category));

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <PageHeader title={`سفارش ${formatId(order.id)}`} subtitle={order.date} back={back} action={<span className={`status-pill ${orderStatusColor[order.status]}`}>{orderStatusLabel[order.status]}</span>} />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {order.status === "cancelled" ? (
            <div className="surface-card border-red-200 bg-red-50/60 text-sm font-bold text-red-700">این سفارش لغو شده است. در صورت پرداخت، مبلغ ظرف ۷۲ ساعت به حساب شما برمی‌گردد.</div>
          ) : (
            <div className="surface-card">
              <div className="mb-5 font-black">وضعیت سفارش</div>
              <div className="order-track">
                {orderSteps.map((step, i) => (
                  <div key={step.label} className={`order-track-step ${i <= current ? "done" : ""} ${i === current + 1 ? "next" : ""}`}>
                    <span>{i <= current ? <Icon name="check" size="sm" /> : formatNumber(i + 1)}</span>
                    <div>{step.label}</div>
                  </div>
                ))}
              </div>
              {order.status === "pending-payment" && <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">پرداخت این سفارش انجام نشده است. تا ۲۴ ساعت فرصت دارید؛ پس از آن سفارش خودکار لغو می‌شود.</div>}
              {order.trackingCode && (
                <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-canvas p-4 text-sm">
                  <span className="text-muted">کد رهگیری مرسوله ({shipping.title}):</span><span className="font-black tracking-wider" dir="ltr">{order.trackingCode}</span>
                  <Button className="mr-auto text-xs font-bold text-brand" onClick={() => { navigator.clipboard?.writeText(order.trackingCode!); toast("کد رهگیری کپی شد"); }}>کپی</Button>
                </div>
              )}
            </div>
          )}

          <div className="surface-card">
            <div className="mb-4 font-black">کالاها</div>
            <div className="space-y-3">
              {order.items.map((item) => {
                const product = products.find((p) => p.id === item.productId)!;
                return (
                  <Button key={item.productId} className="flex w-full items-center gap-3 text-right" onClick={() => navigate("product", product.id)}>
                    <img src={product.image} alt="" className="size-16 rounded-xl object-cover" />
                    <span className="min-w-0 flex-1"><span className="block truncate font-black">{product.name}</span><span className="mt-1 block text-xs text-muted">{formatNumber(item.qty)} عدد × {formatPrice(item.price)}</span></span>
                    <span className="shrink-0 font-black">{formatPrice(item.qty * item.price)}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {hasDevice && order.status === "delivered" && (
            <div className="cross-sell">
              <span className="category-icon bg-white/15 text-white"><Icon name="tool" /></span>
              <div className="flex-1"><div className="font-black">دستگاه رسید؛ نصابش را هم بگیرید</div><div className="mt-1 text-sm text-white/70">نصب توسط متخصص تأییدشده، با حفظ گارانتی.</div></div>
              <Button className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-brand" onClick={() => startService({ service: "نصب", device: products.find((p) => p.id === order.items[0].productId)!.category })}>درخواست نصب</Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="surface-card">
            <div className="mb-3 font-black">ارسال به</div>
            <div className="text-sm leading-7 text-muted">{address.detail}</div>
            <div className="mt-2 text-xs text-faint">{address.receiver} · {address.phone}</div>
            <div className="mt-3 border-t border-line pt-3 text-sm"><span className="text-muted">روش ارسال: </span><span className="font-bold">{shipping.title}</span></div>
          </div>
          <div className="surface-card">
            <div className="mb-3 font-black">پرداخت</div>
            <div className="space-y-2 text-sm">
              <Row label="مبلغ کالاها" value={formatPrice(totals.subtotal)} />
              {totals.discount > 0 && <Row label="تخفیف" value={`− ${formatPrice(totals.discount)}`} accent />}
              <Row label="هزینه ارسال" value={order.shippingCost ? formatPrice(order.shippingCost) : "رایگان"} />
            </div>
            <div className="mt-3 flex justify-between border-t border-line pt-3 font-black"><span>مبلغ کل</span><span>{formatPrice(totals.total)}</span></div>
            {order.paymentRef && <div className="mt-2 text-xs text-muted">کد پیگیری پرداخت: {order.paymentRef}</div>}
          </div>
          <div className="space-y-2">
            {order.status === "pending-payment" && <Button className="primary-button w-full justify-center" onClick={() => startPayment({ kind: "order", amount: totals.total, orderId: order.id })}><Icon name="lock" />پرداخت {formatPrice(totals.total)}</Button>}
            {order.paymentRef && order.status !== "cancelled" && <Button className="secondary-button w-full justify-center" onClick={() => navigate("invoice", order.id)}><Icon name="file" />مشاهده فاکتور</Button>}
            {(order.status === "pending-payment" || order.status === "processing") && <Button className="w-full rounded-2xl border border-red-200 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50" onClick={() => setCancelOpen(true)}>لغو سفارش</Button>}
          </div>
        </div>
      </div>
      <ConfirmDialog open={cancelOpen} onClose={() => setCancelOpen(false)} title="لغو سفارش" text="دلیل لغو را انتخاب کنید." confirmLabel="تأیید لغو سفارش" danger
        reasons={["از خرید منصرف شدم", "قیمت بهتری پیدا کردم", "زمان ارسال طولانی است", "اشتباه در ثبت سفارش"]}
        onConfirm={() => { updateOrder(order.id, { status: "cancelled" }); toast("سفارش لغو شد"); }} />
    </main>
  );
}

// ─────────────────────────────────────────────
// Invoice (printable)
// ─────────────────────────────────────────────

export function InvoiceScreen() {
  const { orders, param, back, addresses, user } = useApp();
  const order = orders.find((item) => item.id === param) ?? orders[0];
  const totals = orderTotals(order.items, order.discount, order.shippingCost);
  const address = addresses.find((item) => item.id === order.addressId) ?? initialAddresses[0];

  return (
    <main className="page-wrap min-h-screen py-6 sm:py-9">
      <div className="no-print"><PageHeader title="فاکتور فروش" subtitle={`سفارش ${formatId(order.id)}`} back={back} action={<Button className="primary-button h-11" onClick={() => window.print()}><Icon name="print" />چاپ / PDF</Button>} /></div>
      <div className="invoice">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-ink pb-5">
          <div className="flex items-center gap-3"><span className="brand-mark"><Icon name="pump" size="lg" /></span><div><div className="text-lg font-black">گروه فنی صنعتی حنیفی</div><div className="mt-1 text-xs text-muted">صورت‌حساب فروش کالا</div></div></div>
          <div className="text-left text-xs leading-6"><div>شماره فاکتور: <b>{formatId(order.id)}</b></div><div>تاریخ: <b>{order.date}</b></div><div>کد پیگیری پرداخت: <b>{order.paymentRef}</b></div></div>
        </div>
        <div className="grid gap-4 py-5 text-xs leading-6 sm:grid-cols-2">
          <div className="rounded-xl bg-canvas p-4"><div className="mb-1 font-black">فروشنده</div>گروه فنی صنعتی حنیفی · شناسه ملی: ۱۴۰۰۰۰۰۰۰۰۰<br />کد اقتصادی: ۴۱۱۱۱۱۱۱۱۱۱۱ · تلفن: ۰۲۱–۴۴۲۲۸۱۰۰<br />تهران، خیابان آزادی، مجتمع صنعتی حنیفی</div>
          <div className="rounded-xl bg-canvas p-4"><div className="mb-1 font-black">خریدار</div>{address.receiver || user?.name} · {address.phone}<br />{address.detail}<br />کد پستی: {address.postalCode || "—"}</div>
        </div>
        <table className="invoice-table">
          <thead><tr><th>ردیف</th><th>شرح کالا</th><th>تعداد</th><th>مبلغ واحد (تومان)</th><th>مبلغ کل (تومان)</th></tr></thead>
          <tbody>{order.items.map((item, i) => { const product = products.find((p) => p.id === item.productId)!; return <tr key={item.productId}><td>{formatNumber(i + 1)}</td><td>{product.name} — {product.model}</td><td>{formatNumber(item.qty)}</td><td>{formatNumber(item.price)}</td><td>{formatNumber(item.price * item.qty)}</td></tr>; })}</tbody>
        </table>
        <div className="mr-auto mt-5 max-w-xs space-y-2 text-sm">
          <Row label="جمع کالاها" value={formatPrice(totals.subtotal)} />
          {totals.discount > 0 && <Row label="تخفیف" value={`− ${formatPrice(totals.discount)}`} />}
          <Row label="هزینه ارسال" value={order.shippingCost ? formatPrice(order.shippingCost) : "۰"} />
          <Row label="مالیات بر ارزش افزوده ۱۰٪ (شامل)" value={formatPrice(totals.vat)} />
          <div className="flex justify-between border-t-2 border-ink pt-2 font-black"><span>مبلغ نهایی</span><span>{formatPrice(totals.total)}</span></div>
        </div>
        <div className="mt-8 text-center text-xs text-muted">این فاکتور به صورت الکترونیکی صادر شده و نیاز به مهر و امضا ندارد.</div>
      </div>
    </main>
  );
}
