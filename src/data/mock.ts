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
      { author: "مسعود نادری", rating: 5, text: "بسیار دقیق و خوش‌قول. مشکل فشار آب کامل برطرف شد.", date: "۱۲ آبان" },
      { author: "شادی مرادی", rating: 5, text: "کار تمیز و حرفه‌ای. هزینه مطابق توافق بود.", date: "۵ آبان" },
      { author: "حسین رضایی", rating: 4, text: "وقت‌شناس و ماهر. توصیه می‌کنم.", date: "۲۸ مهر" },
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
      { author: "فاطمه احمدی", rating: 5, text: "سریع و دقیق. موتور کارخانه را در کمتر از دو ساعت راه انداخت.", date: "۱۰ آبان" },
      { author: "رضا ملکی", rating: 4, text: "متخصص خوب. کمی دیر آمد ولی کار عالی بود.", date: "۱ آبان" },
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
      { author: "نرگس حیدری", rating: 5, text: "بوستر پمپ مجتمع ما را کامل سرویس کرد. عالی بود.", date: "۸ آبان" },
      { author: "کریم تهرانی", rating: 4, text: "دانش فنی خوبی دارد. پیشنهاد می‌کنم.", date: "۲ آبان" },
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
      { author: "محمد کاظمی", rating: 5, text: "پمپ چاه را خوب تعمیر کرد. سریع و بی‌دردسر.", date: "۳ آبان" },
    ],
  },
];

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
    technicianId: 1, createdAt: "۱۸ آبان ۱۴۰۳", scheduledTime: "امروز، ساعت ۱۷",
    address: "سعادت‌آباد، خیابان دانشجو، پلاک ۱۲", laborPrice: 650000, partsPrice: 320000,
  },
  {
    id: 8847, serviceType: "نصب", deviceType: "الکتروموتور", status: "done",
    technicianId: 2, createdAt: "۰۲ آبان ۱۴۰۳", scheduledTime: "۵ آبان، ساعت ۱۰",
    address: "شهرک غرب، فاز ۲", laborPrice: 1200000, partsPrice: 0,
  },
  {
    id: 8791, serviceType: "سرویس دوره‌ای", deviceType: "بوستر پمپ", status: "cancelled",
    technicianId: null, createdAt: "۲۵ مهر ۱۴۰۳", scheduledTime: "۲۸ مهر، ساعت ۱۴",
    address: "نارمک، خیابان ۱۸ شرقی", laborPrice: 500000, partsPrice: 0,
  },
];

export const notifications = [
  { id: 1, title: "سفارش شما ارسال شد", text: "سفارش شماره ۲۸۴۱ به پست تحویل داده شد.", time: "۱۰ دقیقه پیش", unread: true },
  { id: 2, title: "متخصص درخواست را پذیرفت", text: "علیرضا صادقی درخواست تعمیر پمپ را پذیرفت.", time: "۱ ساعت پیش", unread: true },
  { id: 3, title: "پرداخت موفق", text: "پرداخت سفارش شما با موفقیت ثبت شد.", time: "دیروز", unread: false },
];
