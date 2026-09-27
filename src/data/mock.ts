export type Product = {
  id: number;
  name: string;
  model: string;
  category: string;
  price: number;
  oldPrice?: number;
  badge: string;
  image: string;
  stock: number;
  description: string;
};

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

export const categories = [
  { title: "پمپ آب", subtitle: "خانگی و صنعتی", icon: "pump" },
  { title: "الکتروموتور", subtitle: "تک‌فاز و سه‌فاز", icon: "motor" },
  { title: "گیربکس", subtitle: "حلزونی و صنعتی", icon: "gear" },
  { title: "متعلقات", subtitle: "قطعات و تجهیزات", icon: "parts" },
];

export const products: Product[] = [
  {
    id: 1,
    name: "پمپ آب جتی پنتاکس",
    model: "سی‌ای‌ام ۱۰۰ — یک اسب",
    category: "پمپ آب",
    price: 8450000,
    oldPrice: 9200000,
    badge: "پرفروش",
    image: "https://images.unsplash.com/photo-1700318092011-6e4666e94ab5?auto=format&fit=crop&w=900&q=85",
    stock: 8,
    description: "پمپ جتی مناسب افزایش فشار آب ساختمان‌های مسکونی با بدنه مقاوم و عملکرد کم‌صدا.",
  },
  {
    id: 2,
    name: "الکتروموتور موتوژن",
    model: "سه‌فاز — ۳ کیلووات",
    category: "الکتروموتور",
    price: 12800000,
    badge: "موجود",
    image: "https://images.unsplash.com/photo-1674471361339-f720c171ec77?auto=format&fit=crop&w=900&q=85",
    stock: 4,
    description: "الکتروموتور صنعتی با راندمان بالا، مناسب کارکرد پیوسته و محیط‌های صنعتی.",
  },
  {
    id: 3,
    name: "بوستر پمپ آبرسانی",
    model: "دو پمپه — کنترل هوشمند",
    category: "پمپ آب",
    price: 46500000,
    oldPrice: 49000000,
    badge: "ویژه",
    image: "https://images.unsplash.com/photo-1738918929491-3c102ce11c8a?auto=format&fit=crop&w=900&q=85",
    stock: 2,
    description: "سامانه کامل آبرسانی هوشمند برای مجتمع‌های مسکونی و ساختمان‌های اداری.",
  },
  {
    id: 4,
    name: "گیربکس حلزونی سهند",
    model: "سایز ۶۳ — نسبت ۱ به ۳۰",
    category: "گیربکس",
    price: 6750000,
    oldPrice: 7100000,
    badge: "ارسال فوری",
    image: "https://images.unsplash.com/photo-1705579602199-4157a1041a93?auto=format&fit=crop&w=900&q=85",
    stock: 6,
    description: "گیربکس حلزونی پوسته آلومینیومی با انتقال نرم و طول عمر بالا.",
  },
];

export const technicians: Technician[] = [
  { id: 1, name: "علیرضا صادقی", skill: "نصب و تعمیر پمپ", rating: 4.9, jobs: 126, distance: 2.4, status: "آنلاین", acceptance: 96 },
  { id: 2, name: "مهدی کریمی", skill: "برق صنعتی و موتور", rating: 4.8, jobs: 98, distance: 3.1, status: "آنلاین", acceptance: 92 },
  { id: 3, name: "امیرحسین رحمانی", skill: "بوستر پمپ", rating: 4.7, jobs: 74, distance: 4.6, status: "مشغول", acceptance: 89 },
];

export const orders = [
  { id: 2841, date: "۱۴۰۳/۰۸/۱۸", total: 8450000, status: "در حال ارسال", items: 1 },
  { id: 2719, date: "۱۴۰۳/۰۷/۰۲", total: 19600000, status: "تحویل‌شده", items: 2 },
];

export const requests = [
  { id: 7104, service: "تعمیر پمپ آب", customer: "رضا احمدی", area: "سعادت‌آباد", time: "امروز، ساعت ۱۷", status: "جدید", fee: 850000 },
  { id: 7098, service: "سرویس بوستر پمپ", customer: "مجتمع آفتاب", area: "شهرک غرب", time: "فردا، ساعت ۱۰", status: "پذیرفته‌شده", fee: 1450000 },
  { id: 7082, service: "نصب الکتروموتور", customer: "کارگاه نوین", area: "جاده مخصوص", time: "۲۱ آبان", status: "تکمیل‌شده", fee: 2300000 },
];

export const reviews = [
  { id: 1, author: "مسعود نادری", rating: 5, text: "بسیار دقیق و خوش‌قول بودند. مشکل فشار آب کامل برطرف شد.", date: "۱۲ آبان" },
  { id: 2, author: "شادی مرادی", rating: 4, text: "کار تمیز و حرفه‌ای انجام شد و هزینه مطابق توافق بود.", date: "۵ آبان" },
];

export const notifications = [
  { id: 1, title: "سفارش شما ارسال شد", text: "سفارش شماره ۲۸۴۱ به پست تحویل داده شد.", time: "۱۰ دقیقه پیش", unread: true },
  { id: 2, title: "متخصص درخواست را پذیرفت", text: "علیرضا صادقی درخواست تعمیر پمپ را پذیرفت.", time: "۱ ساعت پیش", unread: true },
  { id: 3, title: "پرداخت موفق", text: "پرداخت سفارش شما با موفقیت ثبت شد.", time: "دیروز", unread: false },
];
