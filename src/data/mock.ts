import type { Screen } from "../types";
import pumpImg from "../assets/images/pump.jpg";
import motorImg from "../assets/images/motor.jpg";
import boosterImg from "../assets/images/booster.jpg";
import gearboxImg from "../assets/images/gearbox.jpg";

// ─────────────────────────────────────────────
// Catalog
// ─────────────────────────────────────────────

export type Spec = { label: string; value: string };

export type Product = {
  id: number;
  name: string;
  brand: string;
  model: string;
  category: string;
  price: number;
  oldPrice?: number;
  badge: string;
  image: string;
  gallery: string[];
  stock: number;
  description: string;
  power: number; // horsepower
  phase: "تک‌فاز" | "سه‌فاز" | "—";
  rating: number;
  reviewCount: number;
  sold: number;
  addedOrder: number; // higher = newer
  warranty: string;
  specs: Spec[];
};

const img = {
  pump: pumpImg,
  motor: motorImg,
  booster: boosterImg,
  gearbox: gearboxImg,
};

export const categories = [
  { title: "پمپ آب", subtitle: "خانگی و صنعتی", icon: "pump" },
  { title: "الکتروموتور", subtitle: "تک‌فاز و سه‌فاز", icon: "motor" },
  { title: "گیربکس", subtitle: "حلزونی و صنعتی", icon: "gear" },
  { title: "متعلقات", subtitle: "قطعات و تجهیزات", icon: "parts" },
];

export const products: Product[] = [
  {
    id: 1, name: "پمپ آب جتی پنتاکس", brand: "پنتاکس", model: "CAM 100 — یک اسب", category: "پمپ آب",
    price: 8450000, oldPrice: 9200000, badge: "پرفروش", image: img.pump, gallery: [img.pump, img.booster, img.motor],
    stock: 8, power: 1, phase: "تک‌فاز", rating: 4.8, reviewCount: 64, sold: 412, addedOrder: 3, warranty: "۱۸ ماه",
    description: "پمپ جتی مناسب افزایش فشار آب ساختمان‌های مسکونی با بدنه مقاوم و عملکرد کم‌صدا.",
    specs: [
      { label: "توان", value: "۱ اسب بخار (۰٫۷۵ کیلووات)" }, { label: "ولتاژ", value: "۲۲۰ ولت — تک‌فاز" },
      { label: "دبی", value: "حداکثر ۵۰ لیتر در دقیقه" }, { label: "ارتفاع پمپاژ", value: "حداکثر ۴۰ متر" },
      { label: "وزن", value: "۱۱ کیلوگرم" }, { label: "گارانتی", value: "۱۸ ماه" },
    ],
  },
  {
    id: 2, name: "الکتروموتور موتوژن", brand: "موتوژن", model: "سه‌فاز — ۳ کیلووات", category: "الکتروموتور",
    price: 12800000, badge: "موجود", image: img.motor, gallery: [img.motor, img.gearbox],
    stock: 4, power: 4, phase: "سه‌فاز", rating: 4.7, reviewCount: 38, sold: 190, addedOrder: 2, warranty: "۲۴ ماه",
    description: "الکتروموتور صنعتی با راندمان بالا، مناسب کارکرد پیوسته و محیط‌های صنعتی.",
    specs: [
      { label: "توان", value: "۴ اسب بخار (۳ کیلووات)" }, { label: "ولتاژ", value: "۳۸۰ ولت — سه‌فاز" },
      { label: "دور", value: "۱۴۰۰ دور در دقیقه" }, { label: "کلاس عایق", value: "F" },
      { label: "وزن", value: "۲۴ کیلوگرم" }, { label: "گارانتی", value: "۲۴ ماه" },
    ],
  },
  {
    id: 3, name: "بوستر پمپ آبرسانی", brand: "ابارا", model: "دو پمپه — کنترل هوشمند", category: "پمپ آب",
    price: 46500000, oldPrice: 49000000, badge: "ویژه", image: img.booster, gallery: [img.booster, img.pump],
    stock: 2, power: 3, phase: "سه‌فاز", rating: 4.9, reviewCount: 21, sold: 47, addedOrder: 5, warranty: "۲۴ ماه",
    description: "سامانه کامل آبرسانی هوشمند برای مجتمع‌های مسکونی و ساختمان‌های اداری.",
    specs: [
      { label: "توان", value: "۲ × ۱٫۵ اسب بخار" }, { label: "ولتاژ", value: "۳۸۰ ولت — سه‌فاز" },
      { label: "دبی", value: "حداکثر ۱۸۰ لیتر در دقیقه" }, { label: "ارتفاع پمپاژ", value: "حداکثر ۶۰ متر" },
      { label: "وزن", value: "۸۵ کیلوگرم" }, { label: "گارانتی", value: "۲۴ ماه" },
    ],
  },
  {
    id: 4, name: "گیربکس حلزونی سهند", brand: "سهند", model: "سایز ۶۳ — نسبت ۱ به ۳۰", category: "گیربکس",
    price: 6750000, oldPrice: 7100000, badge: "ارسال فوری", image: img.gearbox, gallery: [img.gearbox, img.motor],
    stock: 6, power: 1, phase: "—", rating: 4.6, reviewCount: 17, sold: 88, addedOrder: 1, warranty: "۱۲ ماه",
    description: "گیربکس حلزونی پوسته آلومینیومی با انتقال نرم و طول عمر بالا.",
    specs: [
      { label: "سایز", value: "۶۳" }, { label: "نسبت تبدیل", value: "۱ به ۳۰" },
      { label: "حداکثر توان ورودی", value: "۱ اسب بخار" }, { label: "جنس بدنه", value: "آلومینیوم" },
      { label: "وزن", value: "۶ کیلوگرم" }, { label: "گارانتی", value: "۱۲ ماه" },
    ],
  },
  {
    id: 5, name: "پمپ شناور چاه دیزل‌پمپ", brand: "دیزل‌پمپ", model: "۴ اینچ — ۱۵ طبقه", category: "پمپ آب",
    price: 31200000, badge: "جدید", image: img.booster, gallery: [img.booster, img.pump],
    stock: 0, power: 2, phase: "تک‌فاز", rating: 4.5, reviewCount: 9, sold: 23, addedOrder: 8, warranty: "۱۸ ماه",
    description: "پمپ شناور مناسب چاه‌های کشاورزی و آبرسانی باغ، با پروانه استیل ضدزنگ.",
    specs: [
      { label: "توان", value: "۲ اسب بخار" }, { label: "ولتاژ", value: "۲۲۰ ولت — تک‌فاز" },
      { label: "دبی", value: "حداکثر ۱۰۰ لیتر در دقیقه" }, { label: "ارتفاع پمپاژ", value: "حداکثر ۹۰ متر" },
      { label: "وزن", value: "۲۲ کیلوگرم" }, { label: "گارانتی", value: "۱۸ ماه" },
    ],
  },
  {
    id: 6, name: "الکتروموتور تک‌فاز الکتروژن", brand: "الکتروژن", model: "۱٫۵ اسب — ۲۸۰۰ دور", category: "الکتروموتور",
    price: 5980000, oldPrice: 6400000, badge: "اقتصادی", image: img.motor, gallery: [img.motor],
    stock: 12, power: 1.5, phase: "تک‌فاز", rating: 4.4, reviewCount: 26, sold: 230, addedOrder: 6, warranty: "۱۲ ماه",
    description: "الکتروموتور تک‌فاز خازن‌دار، مناسب پمپ‌ها و دستگاه‌های کارگاهی سبک.",
    specs: [
      { label: "توان", value: "۱٫۵ اسب بخار" }, { label: "ولتاژ", value: "۲۲۰ ولت — تک‌فاز" },
      { label: "دور", value: "۲۸۰۰ دور در دقیقه" }, { label: "کلاس عایق", value: "F" },
      { label: "وزن", value: "۱۲ کیلوگرم" }, { label: "گارانتی", value: "۱۲ ماه" },
    ],
  },
  {
    id: 7, name: "منبع تحت فشار ۶۰ لیتری", brand: "ابارا", model: "دیافراگمی — ۱۰ بار", category: "متعلقات",
    price: 4350000, badge: "موجود", image: img.pump, gallery: [img.pump],
    stock: 15, power: 0, phase: "—", rating: 4.6, reviewCount: 31, sold: 305, addedOrder: 4, warranty: "۱۲ ماه",
    description: "منبع تحت فشار دیافراگمی برای کاهش دفعات روشن و خاموش شدن پمپ و افزایش عمر آن.",
    specs: [
      { label: "حجم", value: "۶۰ لیتر" }, { label: "حداکثر فشار", value: "۱۰ بار" },
      { label: "نوع", value: "دیافراگمی قابل تعویض" }, { label: "وزن", value: "۱۴ کیلوگرم" },
      { label: "گارانتی", value: "۱۲ ماه" },
    ],
  },
  {
    id: 8, name: "کلید اتوماتیک پمپ (ست‌پرشر)", brand: "پنتاکس", model: "دیجیتال — ۱٫۵ بار", category: "متعلقات",
    price: 1890000, oldPrice: 2100000, badge: "پرفروش", image: img.gearbox, gallery: [img.gearbox],
    stock: 3, power: 0, phase: "—", rating: 4.3, reviewCount: 44, sold: 520, addedOrder: 7, warranty: "۶ ماه",
    description: "کلید اتوماتیک با محافظ کارکرد خشک؛ پمپ را فقط هنگام مصرف روشن می‌کند.",
    specs: [
      { label: "فشار راه‌اندازی", value: "۱٫۵ بار (قابل تنظیم)" }, { label: "حداکثر جریان", value: "۱۰ آمپر" },
      { label: "محافظ کارکرد خشک", value: "دارد" }, { label: "گارانتی", value: "۶ ماه" },
    ],
  },
];

export const brands = Array.from(new Set(products.map((item) => item.brand)));

export const productReviews = [
  { id: 1, productId: 1, author: "مسعود نادری", rating: 5, text: "فشار آب ساختمان کاملاً درست شد و صدایش هم خیلی کم است.", date: "۲۸ شهریور" },
  { id: 2, productId: 1, author: "شادی مرادی", rating: 4, text: "کیفیت ساخت خوب است. ارسال یک روز دیرتر از زمان اعلام‌شده رسید.", date: "۱۹ شهریور" },
  { id: 3, productId: 2, author: "کارگاه نوین", rating: 5, text: "سه ماه است بدون توقف کار می‌کند.", date: "۲ شهریور" },
  { id: 4, productId: 3, author: "مجتمع آفتاب", rating: 5, text: "نصب توسط نصاب حنیفی انجام شد؛ هماهنگی عالی بود.", date: "۱۱ مرداد" },
];

export const discountCodes = [
  { code: "HANIFI10", percent: 10, fixed: 0, minOrder: 5000000, label: "۱۰٪ تخفیف (حداقل خرید ۵ میلیون تومان)" },
  { code: "WELCOME", percent: 0, fixed: 500000, minOrder: 0, label: "۵۰۰٬۰۰۰ تومان تخفیف اولین خرید" },
];

export const shippingMethods = [
  { id: "post", title: "پست پیشتاز", detail: "۳ تا ۵ روز کاری", cost: 180000 },
  { id: "courier", title: "پیک ویژه تهران", detail: "همان روز (سفارش تا ساعت ۱۴)", cost: 250000 },
  { id: "freight", title: "باربری (کالای سنگین)", detail: "۲ تا ۴ روز کاری — پس‌کرایه", cost: 0 },
  { id: "pickup", title: "تحویل حضوری از انبار", detail: "جاده مخصوص، شهرک صنعتی", cost: 0 },
];

export const VAT_RATE = 0.1;

// ─────────────────────────────────────────────
// Customer account
// ─────────────────────────────────────────────

export type Address = { id: number; label: string; icon: "home" | "box"; detail: string; receiver: string; phone: string; postalCode: string };

export const initialAddresses: Address[] = [
  { id: 1, label: "منزل", icon: "home", detail: "تهران، سعادت‌آباد، خیابان دانشجو، پلاک ۱۲، واحد ۴", receiver: "سارا محمدی", phone: "۰۹۱۲۱۲۳۴۵۶۷", postalCode: "۱۹۹۸۷۶۵۴۳۲" },
  { id: 2, label: "محل کار", icon: "box", detail: "تهران، جاده مخصوص، شهرک صنعتی، واحد ۴", receiver: "سارا محمدی", phone: "۰۹۱۲۱۲۳۴۵۶۷", postalCode: "۱۳۸۷۶۵۴۳۲۱" },
];

export type OrderStatus = "pending-payment" | "processing" | "shipped" | "delivered" | "cancelled";
export type OrderItem = { productId: number; qty: number; price: number };

export type Order = {
  id: number;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  shippingId: string;
  shippingCost: number;
  discount: number;
  addressId: number;
  paymentRef?: string;
  trackingCode?: string;
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  "pending-payment": "در انتظار پرداخت",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

export const orderStatusColor: Record<OrderStatus, string> = {
  "pending-payment": "bg-amber-50 text-amber-700",
  processing: "bg-sky-50 text-sky-700",
  shipped: "bg-violet-50 text-violet-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-600",
};

export const initialOrders: Order[] = [
  { id: 2841, date: "۲ مهر ۱۴۰۵", status: "shipped", items: [{ productId: 1, qty: 1, price: 8450000 }], shippingId: "post", shippingCost: 180000, discount: 0, addressId: 1, paymentRef: "۶۲۸۴۱۹۰۳۷۷", trackingCode: "۱۲۳۴۵۶۷۸۹۰۱۲۳۴۵۶۷۸۹۰۱۲" },
  { id: 2833, date: "۳۰ شهریور ۱۴۰۵", status: "pending-payment", items: [{ productId: 8, qty: 2, price: 1890000 }], shippingId: "courier", shippingCost: 250000, discount: 0, addressId: 1 },
  { id: 2719, date: "۱۴ شهریور ۱۴۰۵", status: "delivered", items: [{ productId: 2, qty: 1, price: 12800000 }, { productId: 4, qty: 1, price: 6750000 }], shippingId: "freight", shippingCost: 0, discount: 500000, addressId: 2, paymentRef: "۶۲۷۱۹۸۸۲۱۴" },
  { id: 2650, date: "۲ مرداد ۱۴۰۵", status: "cancelled", items: [{ productId: 7, qty: 1, price: 4350000 }], shippingId: "post", shippingCost: 180000, discount: 0, addressId: 1 },
];

export type CustomerNotification = { id: number; icon: "bag" | "tool" | "wallet" | "check" | "close" | "pin" | "bell" | "star"; title: string; text: string; time: string; unread: boolean; target: Screen };

export const customerNotifications: CustomerNotification[] = [
  { id: 1, icon: "pin", title: "نصاب نزدیک شماست", text: "علیرضا صادقی حدود ۱۰ دقیقه دیگر به محل شما می‌رسد.", time: "۲ دقیقه پیش", unread: true, target: "request-status" },
  { id: 2, icon: "wallet", title: "پیشنهاد قیمت دریافت شد", text: "برای درخواست ۹۰۰۱ پیشنهاد ۹۷۰٬۰۰۰ تومان ثبت شد.", time: "۱۵ دقیقه پیش", unread: true, target: "request-status" },
  { id: 3, icon: "check", title: "نصاب درخواست را پذیرفت", text: "علیرضا صادقی درخواست تعمیر پمپ آب را پذیرفت.", time: "۱ ساعت پیش", unread: true, target: "request-status" },
  { id: 4, icon: "bag", title: "سفارش شما ارسال شد", text: "سفارش ۲۸۴۱ تحویل پست شد. کد رهگیری در صفحه سفارش است.", time: "۳ ساعت پیش", unread: false, target: "orders" },
  { id: 5, icon: "close", title: "درخواست توسط نصاب رد شد", text: "مهدی کریمی امکان مراجعه نداشت. نصاب‌های دیگر پیشنهاد شده‌اند.", time: "دیروز", unread: false, target: "my-requests" },
  { id: 6, icon: "star", title: "کار انجام شد؛ نظرتان چیست؟", text: "نصب الکتروموتور به پایان رسید. به نصاب امتیاز دهید.", time: "دیروز", unread: false, target: "rating" },
  { id: 7, icon: "wallet", title: "پرداخت موفق", text: "پرداخت سفارش ۲۷۱۹ با موفقیت ثبت شد.", time: "۱۴ شهریور", unread: false, target: "orders" },
  { id: 8, icon: "bell", title: "پیام مدیریت", text: "ساعات کاری پشتیبانی در روزهای تعطیل از ۱۰ تا ۱۶ است.", time: "۱۰ شهریور", unread: false, target: "support" },
];

// ─────────────────────────────────────────────
// Technicians (customer-facing)
// ─────────────────────────────────────────────

export type Technician = {
  id: number;
  name: string;
  skill: string;
  rating: number;
  jobs: number;
  distance: number;
  status: "آنلاین" | "آفلاین" | "مشغول";
  acceptance: number;
};

export type ExtendedTechnician = Technician & {
  city: string;
  area: string;
  specialties: string[];
  experience: number;
  tariffs: { label: string; price: number }[];
  ratingBreakdown: [number, number, number, number, number];
  techReviews: { author: string; rating: number; text: string; date: string }[];
};

export const extendedTechnicians: ExtendedTechnician[] = [
  {
    id: 1, name: "علیرضا صادقی", skill: "نصب و تعمیر پمپ", rating: 4.9, jobs: 126, distance: 2.4, status: "آنلاین", acceptance: 96,
    city: "تهران", area: "شمال تهران — زعفرانیه، نیاوران، اوین",
    specialties: ["پمپ آب جتی", "بوستر پمپ", "پمپ شناور", "آبرسانی هوشمند"],
    experience: 11,
    tariffs: [
      { label: "بازدید و تشخیص عیب", price: 350000 },
      { label: "نصب پمپ جتی", price: 900000 },
      { label: "نصب بوستر پمپ", price: 1800000 },
      { label: "تعمیرات عمومی", price: 650000 },
    ],
    ratingBreakdown: [108, 14, 3, 1, 0],
    techReviews: [
      { author: "مسعود نادری", rating: 5, text: "بسیار دقیق و خوش‌قول. مشکل فشار آب کامل برطرف شد.", date: "۱ مهر" },
      { author: "شادی مرادی", rating: 5, text: "کار تمیز و حرفه‌ای. هزینه مطابق توافق بود.", date: "۲۵ شهریور" },
      { author: "حسین رضایی", rating: 4, text: "وقت‌شناس و ماهر. توصیه می‌کنم.", date: "۱۸ شهریور" },
    ],
  },
  {
    id: 2, name: "مهدی کریمی", skill: "برق صنعتی و موتور", rating: 4.8, jobs: 98, distance: 3.1, status: "آنلاین", acceptance: 92,
    city: "تهران", area: "غرب تهران — سعادت‌آباد، شهرک غرب، پونک",
    specialties: ["الکتروموتور تک‌فاز", "الکتروموتور سه‌فاز", "سیم‌پیچی موتور", "تابلو برق صنعتی"],
    experience: 8,
    tariffs: [
      { label: "بازدید و تشخیص عیب", price: 300000 },
      { label: "نصب الکتروموتور", price: 1200000 },
      { label: "سیم‌پیچی موتور", price: 2500000 },
      { label: "تعمیرات برقی", price: 700000 },
    ],
    ratingBreakdown: [82, 12, 3, 1, 0],
    techReviews: [
      { author: "فاطمه احمدی", rating: 5, text: "سریع و دقیق. موتور کارخانه را در کمتر از دو ساعت راه انداخت.", date: "۳۰ شهریور" },
      { author: "رضا ملکی", rating: 4, text: "متخصص خوب. کمی دیر آمد ولی کار عالی بود.", date: "۲۱ شهریور" },
    ],
  },
  {
    id: 3, name: "امیرحسین رحمانی", skill: "بوستر پمپ و گیربکس", rating: 4.7, jobs: 74, distance: 4.6, status: "مشغول", acceptance: 89,
    city: "تهران", area: "شرق تهران — نارمک، تهران‌پارس، میدان رسالت",
    specialties: ["بوستر پمپ چند طبقه", "گیربکس حلزونی", "گیربکس صنعتی", "سرویس دوره‌ای"],
    experience: 6,
    tariffs: [
      { label: "بازدید و تشخیص عیب", price: 280000 },
      { label: "نصب بوستر پمپ", price: 1600000 },
      { label: "تعمیر گیربکس", price: 1100000 },
      { label: "سرویس دوره‌ای", price: 500000 },
    ],
    ratingBreakdown: [62, 9, 2, 1, 0],
    techReviews: [
      { author: "نرگس حیدری", rating: 5, text: "بوستر پمپ مجتمع ما را کامل سرویس کرد. عالی بود.", date: "۲۸ شهریور" },
      { author: "کریم تهرانی", rating: 4, text: "دانش فنی خوبی دارد. پیشنهاد می‌کنم.", date: "۲۲ شهریور" },
    ],
  },
  {
    id: 4, name: "سجاد ولی‌پور", skill: "نصب پمپ شناور و چاه", rating: 4.6, jobs: 52, distance: 5.8, status: "آفلاین", acceptance: 85,
    city: "تهران", area: "جنوب تهران — خزانه، منیریه، مولوی",
    specialties: ["پمپ شناور چاه", "پمپ سانتریفیوژ", "پمپ دوپایه", "لوله‌کشی صنعتی"],
    experience: 5,
    tariffs: [
      { label: "بازدید و تشخیص عیب", price: 250000 },
      { label: "نصب پمپ شناور", price: 2200000 },
      { label: "تعمیر پمپ سانتریفیوژ", price: 900000 },
      { label: "لوله‌کشی", price: 800000 },
    ],
    ratingBreakdown: [40, 9, 2, 1, 0],
    techReviews: [
      { author: "محمد کاظمی", rating: 5, text: "پمپ چاه را خوب تعمیر کرد. سریع و بی‌دردسر.", date: "۲۰ شهریور" },
    ],
  },
];

export const technicians: Technician[] = extendedTechnicians;

export type ServiceRequestStatus = "waiting" | "accepted" | "quote" | "enroute" | "done" | "paid" | "rated" | "cancelled";

export type ServiceRequest = {
  id: number;
  serviceType: string;
  deviceType: string;
  status: ServiceRequestStatus;
  technicianId: number | null;
  createdAt: string;
  scheduledTime: string;
  address: string;
  laborPrice: number;
  partsPrice: number;
};

export const myServiceRequests: ServiceRequest[] = [
  {
    id: 9001, serviceType: "تعمیر", deviceType: "پمپ آب", status: "quote",
    technicianId: 1, createdAt: "۵ مهر ۱۴۰۵", scheduledTime: "امروز، ساعت ۱۷",
    address: "سعادت‌آباد، خیابان دانشجو، پلاک ۱۲", laborPrice: 650000, partsPrice: 320000,
  },
  {
    id: 8847, serviceType: "نصب", deviceType: "الکتروموتور", status: "done",
    technicianId: 2, createdAt: "۲۵ شهریور ۱۴۰۵", scheduledTime: "۲۸ شهریور، ساعت ۱۰",
    address: "شهرک غرب، فاز ۲", laborPrice: 1200000, partsPrice: 0,
  },
  {
    id: 8791, serviceType: "سرویس دوره‌ای", deviceType: "بوستر پمپ", status: "cancelled",
    technicianId: null, createdAt: "۱۸ شهریور ۱۴۰۵", scheduledTime: "۲۰ شهریور، ساعت ۱۴",
    address: "نارمک، خیابان ۱۸ شرقی", laborPrice: 500000, partsPrice: 0,
  },
];

// ─────────────────────────────────────────────
// Technician app
// ─────────────────────────────────────────────

export type IncomingRequest = {
  id: number;
  service: string;
  device: string;
  problem: string;
  photos: string[];
  area: string;
  distance: number;
  time: string;
  expiresIn: number; // seconds
  customer: string;
  exactAddress: string;
  estimate: number;
};

export const incomingRequests: IncomingRequest[] = [
  {
    id: 9012, service: "تعمیر", device: "پمپ آب جتی", problem: "پمپ روشن می‌شود ولی فشار آب طبقه سوم خیلی کم است و صدای غیرعادی می‌دهد.",
    photos: [img.pump, img.booster], area: "سعادت‌آباد", distance: 2.1, time: "امروز، ۱۷ تا ۲۰", expiresIn: 272,
    customer: "رضا احمدی", exactAddress: "سعادت‌آباد، خیابان سرو غربی، کوچه ۱۴، پلاک ۸، زنگ ۳", estimate: 850000,
  },
  {
    id: 9015, service: "سرویس دوره‌ای", device: "بوستر پمپ دو پمپه", problem: "سرویس شش‌ماهه بوستر مجتمع ۲۴ واحدی؛ تعویض فیلتر و بررسی تابلو.",
    photos: [img.booster], area: "شهرک غرب", distance: 3.8, time: "فردا، ۸ تا ۱۱", expiresIn: 540,
    customer: "مدیریت مجتمع آفتاب", exactAddress: "شهرک غرب، بلوار دریا، مجتمع آفتاب، موتورخانه زیرزمین", estimate: 1450000,
  },
  {
    id: 9018, service: "عیب‌یابی", device: "الکتروموتور سه‌فاز", problem: "موتور بعد از چند دقیقه کار داغ می‌کند و حفاظت قطع می‌کند.",
    photos: [], area: "جاده مخصوص", distance: 9.4, time: "در سریع‌ترین زمان", expiresIn: 95,
    customer: "کارگاه نوین", exactAddress: "جاده مخصوص، کیلومتر ۷، خیابان صنعت ۳، سوله ۱۲", estimate: 600000,
  },
];

export type TechJob = { id: number; service: string; customer: string; area: string; date: string; status: "active" | "done" | "rejected"; fee: number; commissionRate: number; reason?: string };

export const techJobs: TechJob[] = [
  { id: 9001, service: "تعمیر پمپ آب", customer: "سارا محمدی", area: "سعادت‌آباد", date: "امروز، ۱۷", status: "active", fee: 970000, commissionRate: 0.12 },
  { id: 8990, service: "نصب بوستر پمپ", customer: "مجتمع نگین", area: "پونک", date: "۳ مهر", status: "done", fee: 1800000, commissionRate: 0.12 },
  { id: 8972, service: "تعمیر پمپ جتی", customer: "حسین رضایی", area: "اوین", date: "۱ مهر", status: "done", fee: 650000, commissionRate: 0.12 },
  { id: 8961, service: "بازدید و تشخیص عیب", customer: "کارخانه آریا", area: "شهرک غرب", date: "۳۰ شهریور", status: "done", fee: 350000, commissionRate: 0.1 },
  { id: 8944, service: "نصب پمپ شناور", customer: "باغ حسینی", area: "لواسان", date: "۲۸ شهریور", status: "rejected", fee: 2200000, commissionRate: 0.12, reason: "خارج از محدوده فعالیت" },
  { id: 8930, service: "سرویس دوره‌ای", customer: "مجتمع آفتاب", area: "شهرک غرب", date: "۲۵ شهریور", status: "done", fee: 500000, commissionRate: 0.12 },
];

export const settlements = [
  { id: 311, date: "۱ مهر ۱۴۰۵", amount: 3960000, status: "پرداخت شده", ref: "۱۴۰۵۰۷۰۱۸۸۲" },
  { id: 298, date: "۱۵ شهریور ۱۴۰۵", amount: 5120000, status: "پرداخت شده", ref: "۱۴۰۵۰۶۱۵۴۱۰" },
  { id: 284, date: "۱ شهریور ۱۴۰۵", amount: 4480000, status: "پرداخت شده", ref: "۱۴۰۵۰۶۰۱۲۷۳" },
];

export const techNotifications = [
  { id: 1, icon: "tool" as const, title: "درخواست جدید در محدوده شما", text: "تعمیر پمپ آب جتی — سعادت‌آباد، ۲٫۱ کیلومتر", time: "همین حالا", unread: true },
  { id: 2, icon: "close" as const, title: "درخواست توسط مشتری لغو شد", text: "درخواست ۸۹۸۸ به دلیل «تغییر برنامه» لغو شد.", time: "۱ ساعت پیش", unread: true },
  { id: 3, icon: "wallet" as const, title: "تسویه انجام شد", text: "مبلغ ۳٬۹۶۰٬۰۰۰ تومان به حساب شما واریز شد.", time: "۱ مهر", unread: false },
  { id: 4, icon: "shield" as const, title: "مدارک شما تأیید شد", text: "گواهی فنی‌وحرفه‌ای جدید شما تأیید شد.", time: "۲۸ شهریور", unread: false },
  { id: 5, icon: "bell" as const, title: "پیام مدیریت", text: "از ۱۰ مهر کمیسیون خدمات سرویس دوره‌ای به ۱۰٪ کاهش می‌یابد.", time: "۲۵ شهریور", unread: false },
];

export const specialtyOptions = ["نصب پمپ آب", "تعمیر پمپ آب", "بوستر پمپ", "پمپ شناور و چاه", "تعمیر الکتروموتور", "سیم‌پیچی موتور", "گیربکس", "برق صنعتی و تابلو", "لوله‌کشی صنعتی"];
export const tehranAreas = ["شمال تهران", "غرب تهران", "مرکز تهران", "شرق تهران", "جنوب تهران", "کرج", "شهریار", "لواسان"];

// ─────────────────────────────────────────────
// Admin panel
// ─────────────────────────────────────────────

const firstNames = ["علی", "مریم", "حسین", "زهرا", "رضا", "فاطمه", "محمد", "نرگس", "امیر", "سمیه", "مهدی", "لیلا", "حمید", "الهام", "سعید", "پریسا"];
const lastNames = ["احمدی", "کریمی", "رضایی", "موسوی", "حسینی", "نادری", "صالحی", "رحیمی", "جعفری", "کاظمی", "طاهری", "بهرامی"];
const pick = <T,>(list: T[], i: number) => list[i % list.length];
const personName = (i: number) => `${pick(firstNames, i * 7 + 3)} ${pick(lastNames, i * 5 + 1)}`;
const persianPhone = (i: number) => `۰۹${(120000000 + i * 7919031 % 290000000).toLocaleString("fa-IR", { useGrouping: false })}`;
/** Builds a checksum-valid national code from a 9-digit body (mock data only). */
const validNationalCode = (body: number) => {
  const digits = String(body).padStart(9, "0");
  const r = digits.split("").reduce((acc, d, i) => acc + Number(d) * (10 - i), 0) % 11;
  return `${digits}${r < 2 ? r : 11 - r}`;
};
const mehrDate = (i: number) => (i < 5 ? `${(5 - i).toLocaleString("fa-IR")} مهر` : `${(31 - (i - 5) % 30).toLocaleString("fa-IR")} شهریور`);

export type DocStatus = "در انتظار" | "تأییدشده" | "ردشده";
export type PendingTechnician = {
  id: number; name: string; phone: string; city: string; specialties: string[]; submitted: string; nationalCode: string;
  docs: { key: string; label: string; status: DocStatus }[]; sheba: string; bankHolder: string;
};

export const pendingTechnicians: PendingTechnician[] = Array.from({ length: 8 }, (_, i) => ({
  id: 500 + i,
  name: personName(i + 20),
  phone: persianPhone(i + 3),
  city: pick(["تهران", "کرج", "تهران", "اصفهان", "تهران", "شیراز"], i),
  specialties: [pick(specialtyOptions, i), pick(specialtyOptions, i + 3)],
  submitted: mehrDate(i),
  nationalCode: validNationalCode(29100000 + i * 13579),
  sheba: `IR${(120170000000 + i * 91).toString()}0000${(4210 + i).toString()}98`,
  bankHolder: personName(i + 20),
  docs: [
    { key: "card", label: "تصویر کارت ملی", status: "در انتظار" },
    { key: "selfie", label: "عکس شخص (سلفی)", status: i % 3 === 1 ? "ردشده" : "در انتظار" },
    { key: "cert", label: "گواهی فنی‌وحرفه‌ای", status: "در انتظار" },
    { key: "bank", label: "اطلاعات بانکی", status: i % 4 === 0 ? "تأییدشده" : "در انتظار" },
  ],
}));

export type AccountStatus = "فعال" | "در انتظار" | "تعلیق" | "مسدود";
export const adminTechnicians = [
  ...extendedTechnicians.map((tech) => ({ id: tech.id, name: tech.name, skill: tech.skill, city: tech.city, rating: tech.rating, jobs: tech.jobs, acceptance: tech.acceptance, online: tech.status, account: "فعال" as AccountStatus, earnings: tech.jobs * 610000 })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: 10 + i, name: personName(i + 40), skill: pick(specialtyOptions, i * 2), city: pick(["تهران", "کرج", "تهران", "اصفهان"], i),
    rating: 4 + ((i * 3) % 10) / 10, jobs: 8 + i * 9, acceptance: 70 + ((i * 7) % 28),
    online: pick(["آنلاین", "آفلاین", "مشغول", "آفلاین"] as Technician["status"][], i),
    account: pick(["فعال", "فعال", "تعلیق", "فعال", "مسدود", "در انتظار"] as AccountStatus[], i), earnings: (8 + i * 9) * 540000,
  })),
];

export const adminCustomers = Array.from({ length: 23 }, (_, i) => ({
  id: 1000 + i, name: personName(i), phone: persianPhone(i), city: pick(["تهران", "کرج", "تهران", "اصفهان", "شیراز"], i),
  orders: (i * 3) % 7, requests: (i * 5) % 4, joined: `${pick(["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور"], i)} ۱۴۰۵`,
  blocked: i === 6 || i === 17,
}));

export const adminOrders = Array.from({ length: 26 }, (_, i) => {
  const product = pick(products, i * 3);
  const qty = 1 + (i % 3 === 0 ? 1 : 0);
  return {
    id: 2860 - i * 3, customer: personName(i + 5), date: mehrDate(Math.floor(i / 2)), items: qty, product: product.name,
    total: product.price * qty + 180000,
    status: pick(["processing", "pending-payment", "shipped", "delivered", "delivered", "cancelled", "processing"] as OrderStatus[], i),
  };
});

export const requestStatusLabel: Record<ServiceRequestStatus, string> = {
  waiting: "در انتظار پذیرش", accepted: "پذیرفته‌شده", quote: "در انتظار تأیید قیمت", enroute: "نصاب در راه",
  done: "انجام‌شده", paid: "پرداخت‌شده", rated: "تکمیل‌شده", cancelled: "لغوشده",
};

export const adminRequests = Array.from({ length: 22 }, (_, i) => ({
  id: 9020 - i * 2, customer: personName(i + 9), service: pick(["تعمیر پمپ آب", "نصب بوستر پمپ", "عیب‌یابی الکتروموتور", "سرویس دوره‌ای", "نصب پمپ جتی"], i),
  area: pick(["سعادت‌آباد", "شهرک غرب", "نارمک", "پونک", "جاده مخصوص", "تهران‌پارس"], i), date: mehrDate(Math.floor(i / 3)),
  technicianId: i % 5 === 0 ? null : pick(extendedTechnicians, i).id,
  status: pick(["waiting", "accepted", "quote", "enroute", "done", "paid", "rated", "cancelled", "rated"] as ServiceRequestStatus[], i),
  amount: pick([850000, 1800000, 600000, 500000, 970000], i),
}));

export const commissionSettings = {
  global: 12,
  byService: [
    { service: "نصب", rate: 12 }, { service: "تعمیر", rate: 12 }, { service: "عیب‌یابی", rate: 15 }, { service: "سرویس دوره‌ای", rate: 10 },
  ],
  byRegion: [
    { region: "تهران", rate: 12 }, { region: "کرج", rate: 10 }, { region: "اصفهان", rate: 10 }, { region: "شیراز", rate: 8 },
  ],
};

export const pendingSettlements = adminTechnicians.filter((tech) => tech.account === "فعال").slice(0, 7).map((tech, i) => ({
  id: 320 + i, technician: tech.name, jobs: 3 + (i % 4), gross: 2400000 + i * 830000, commission: Math.round((2400000 + i * 830000) * 0.12), period: "۱ تا ۱۵ مهر",
}));

export const transactions = Array.from({ length: 30 }, (_, i) => ({
  id: 77410 - i * 7, date: mehrDate(Math.floor(i / 3)), party: personName(i + 2),
  type: pick(["خرید کالا", "پرداخت خدمت", "تسویه نصاب", "بازگشت وجه", "خرید کالا", "پرداخت خدمت"], i),
  amount: pick([8450000, 970000, 3960000, 4350000, 12800000, 1450000], i),
  status: i % 9 === 4 ? "ناموفق" : "موفق", gateway: pick(["ملت", "سامان", "پارسیان"], i), ref: (628400000 + i * 7331).toLocaleString("fa-IR", { useGrouping: false }),
}));

export const adminDiscounts = [
  { code: "HANIFI10", kind: "percent" as const, value: 10, minOrder: 5000000, expires: "۳۰ مهر ۱۴۰۵", used: 142, limit: 500, active: true },
  { code: "WELCOME", kind: "fixed" as const, value: 500000, minOrder: 0, expires: "۲۹ اسفند ۱۴۰۵", used: 811, limit: 0, active: true },
  { code: "PUMP5", kind: "percent" as const, value: 5, minOrder: 8000000, expires: "۳۱ شهریور ۱۴۰۵", used: 64, limit: 100, active: false },
  { code: "BOOSTER2M", kind: "fixed" as const, value: 2000000, minOrder: 40000000, expires: "۱۵ آبان ۱۴۰۵", used: 9, limit: 50, active: true },
];

export const moderationReviews = [
  { id: 1, author: "مسعود نادری", target: "علیرضا صادقی (نصاب)", rating: 5, text: "بسیار دقیق و خوش‌قول. مشکل فشار آب کامل برطرف شد.", date: "۱ مهر", state: "در انتظار" },
  { id: 2, author: "کاربر ۱۰۱۷", target: "پمپ آب جتی پنتاکس (محصول)", rating: 1, text: "این محصول تقلبی است، از جای دیگر ارزان‌تر بخرید: t.me/…", date: "۳۰ شهریور", state: "گزارش‌شده" },
  { id: 3, author: "رضا ملکی", target: "مهدی کریمی (نصاب)", rating: 4, text: "متخصص خوب. کمی دیر آمد ولی کار عالی بود.", date: "۲۹ شهریور", state: "منتشرشده" },
  { id: 4, author: "شادی مرادی", target: "الکتروموتور موتوژن (محصول)", rating: 4, text: "کیفیت ساخت خوب است، ارسال یک روز دیرتر رسید.", date: "۲۸ شهریور", state: "در انتظار" },
  { id: 5, author: "کاربر ۱۰۰۴", target: "امیرحسین رحمانی (نصاب)", rating: 2, text: "نصاب بدون هماهنگی ۲ ساعت دیر آمد و پاسخگو نبود.", date: "۲۷ شهریور", state: "گزارش‌شده" },
];

// Monthly figures (million tomans) for the last 6 Jalali months.
export const monthlyReport = [
  { month: "فروردین", sales: 182, services: 41, commission: 4.9 },
  { month: "اردیبهشت", sales: 214, services: 52, commission: 6.2 },
  { month: "خرداد", sales: 238, services: 58, commission: 7.0 },
  { month: "تیر", sales: 221, services: 66, commission: 7.9 },
  { month: "مرداد", sales: 262, services: 71, commission: 8.5 },
  { month: "شهریور", sales: 285, services: 83, commission: 10.0 },
];

export const weeklySales = [
  { day: "شنبه", value: 38 }, { day: "یکشنبه", value: 52 }, { day: "دوشنبه", value: 44 }, { day: "سه‌شنبه", value: 61 },
  { day: "چهارشنبه", value: 57 }, { day: "پنجشنبه", value: 72 }, { day: "جمعه", value: 21 },
];

export const sentNotifications = [
  { id: 1, audience: "همه نصاب‌ها", title: "کاهش کمیسیون سرویس دوره‌ای", date: "۲۵ شهریور", reach: 64 },
  { id: 2, audience: "مشتریان تهران", title: "کد تخفیف HANIFI10 تا پایان مهر", date: "۲۰ شهریور", reach: 3120 },
  { id: 3, audience: "همه مشتریان", title: "ساعات کاری پشتیبانی در تعطیلات", date: "۱۰ شهریور", reach: 5480 },
];

export const coverageRegions = [
  { id: 1, city: "تهران", areas: ["شمال", "غرب", "مرکز", "شرق", "جنوب"], technicians: 48, active: true },
  { id: 2, city: "کرج", areas: ["عظیمیه", "گوهردشت", "مهرشهر"], technicians: 9, active: true },
  { id: 3, city: "اصفهان", areas: ["مرکز", "خمینی‌شهر"], technicians: 5, active: true },
  { id: 4, city: "شیراز", areas: ["مرکز"], technicians: 2, active: false },
];

export const adminUsers = [
  { id: 1, name: "حمید حنیفی", role: "مدیر کل", email: "h.hanifi@hanifi.ir", lastSeen: "آنلاین" },
  { id: 2, name: "الهام صالحی", role: "کارشناس احراز هویت", email: "e.salehi@hanifi.ir", lastSeen: "۱۰ دقیقه پیش" },
  { id: 3, name: "سعید بهرامی", role: "مدیر فروشگاه", email: "s.bahrami@hanifi.ir", lastSeen: "۲ ساعت پیش" },
  { id: 4, name: "پریسا طاهری", role: "پشتیبانی", email: "p.taheri@hanifi.ir", lastSeen: "دیروز" },
];

export const adminRoles = ["مدیر کل", "مدیر فروشگاه", "کارشناس احراز هویت", "مالی", "پشتیبانی"];
