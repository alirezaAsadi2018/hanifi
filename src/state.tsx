import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { customerNotifications, initialAddresses, initialOrders, products, shippingMethods, type Address, type Order } from "./data/mock";
import { checkCoupon, linesToItems, orderTotals, type CartLine } from "./lib/pricing";
import type { Navigate, Role, Screen, ServicePrefill } from "./types";

export type User = { name: string; phone: string };
export type PaymentContext = { kind: "order"; amount: number; orderId: number } | { kind: "service"; amount: number; requestId: number };
export type TechnicianEntry = "dashboard" | "onboarding";

type AppState = {
  role: Role;
  switchRole: (role: Role, techEntry?: TechnicianEntry) => void;
  techEntry: TechnicianEntry;
  screen: Screen;
  param: number;
  navigate: Navigate;
  back: () => void;
  user: User | null;
  /** `stay` keeps the current screen (used when a protected screen asked for login in place). */
  login: (user: User, stay?: boolean) => void;
  logout: () => void;
  /** Returns true when logged in; otherwise sends the user to login and resumes `target` afterwards. */
  requireLogin: (target: Screen, id?: number) => boolean;
  cart: CartLine[];
  cartCount: number;
  addToCart: (productId: number, qty?: number) => void;
  setQty: (productId: number, qty: number) => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  addresses: Address[];
  saveAddress: (address: Address) => void;
  removeAddress: (id: number) => void;
  orders: Order[];
  placeOrder: (addressId: number, shippingId: string) => Order;
  updateOrder: (id: number, patch: Partial<Order>) => void;
  notifications: typeof customerNotifications;
  markRead: (id: number) => void;
  markAllRead: () => void;
  servicePrefill: ServicePrefill;
  startService: (prefill?: ServicePrefill) => void;
  payment: PaymentContext;
  startPayment: (payment: PaymentContext) => void;
  toast: (message: string) => void;
  notice: string;
};

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("customer");
  const [techEntry, setTechEntry] = useState<TechnicianEntry>("dashboard");
  const [history, setHistory] = useState<{ screen: Screen; param: number }[]>([{ screen: "home", param: 0 }]);
  const [user, setUser] = useState<User | null>(null);
  const [afterLogin, setAfterLogin] = useState<{ screen: Screen; param: number } | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [addresses, setAddresses] = useState(initialAddresses);
  const [orders, setOrders] = useState(initialOrders);
  const [notifications, setNotifications] = useState(customerNotifications);
  const [servicePrefill, setServicePrefill] = useState<ServicePrefill>({});
  const [payment, setPayment] = useState<PaymentContext>({ kind: "service", amount: 970000, requestId: 9001 });
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef<number | undefined>(undefined);

  const current = history[history.length - 1];

  const navigate = useCallback<Navigate>((screen, id) => {
    setHistory((stack) => [...stack.slice(-30), { screen, param: id ?? 0 }]);
    window.scrollTo({ top: 0 });
  }, []);

  const back = useCallback(() => {
    setHistory((stack) => (stack.length > 1 ? stack.slice(0, -1) : [{ screen: "home", param: 0 }]));
    window.scrollTo({ top: 0 });
  }, []);

  const toast = useCallback((message: string) => {
    window.clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 2600);
  }, []);

  const value = useMemo<AppState>(() => {
    const requireLogin = (target: Screen, id?: number) => {
      if (user) return true;
      setAfterLogin({ screen: target, param: id ?? 0 });
      navigate("login");
      return false;
    };

    return {
      role,
      techEntry,
      switchRole: (next, entry = "dashboard") => {
        setRole(next);
        setTechEntry(entry);
        window.scrollTo({ top: 0 });
      },
      screen: current.screen,
      param: current.param,
      navigate,
      back,
      user,
      login: (next, stay = false) => {
        const firstLogin = !user;
        setUser(next);
        if (stay) {
          if (firstLogin) toast(`${next.name} عزیز، خوش آمدید`);
          return;
        }
        const target = afterLogin ?? { screen: "profile" as Screen, param: 0 };
        setAfterLogin(null);
        // Replace the login screen in history so "back" does not return to it.
        setHistory((stack) => [...stack.filter((entry) => entry.screen !== "login"), target]);
        toast(`${next.name} عزیز، خوش آمدید`);
      },
      logout: () => {
        setUser(null);
        setHistory([{ screen: "home", param: 0 }]);
        toast("از حساب کاربری خارج شدید");
      },
      requireLogin,
      cart,
      cartCount: cart.reduce((sum, line) => sum + line.qty, 0),
      addToCart: (productId, qty = 1) => {
        const product = products.find((item) => item.id === productId);
        if (!product || product.stock === 0) return;
        setCart((lines) => {
          const existing = lines.find((line) => line.productId === productId);
          if (!existing) return [...lines, { productId, qty: Math.min(qty, product.stock) }];
          return lines.map((line) => (line.productId === productId ? { ...line, qty: Math.min(line.qty + qty, product.stock) } : line));
        });
        toast("محصول به سبد خرید اضافه شد");
      },
      setQty: (productId, qty) =>
        setCart((lines) => (qty <= 0 ? lines.filter((line) => line.productId !== productId) : lines.map((line) => (line.productId === productId ? { ...line, qty } : line)))),
      couponCode,
      setCouponCode,
      addresses,
      saveAddress: (address) =>
        setAddresses((list) => (list.some((item) => item.id === address.id) ? list.map((item) => (item.id === address.id ? address : item)) : [...list, address])),
      removeAddress: (id) => setAddresses((list) => list.filter((item) => item.id !== id)),
      orders,
      placeOrder: (addressId, shippingId) => {
        const items = linesToItems(cart);
        const subtotal = orderTotals(items, 0, 0).subtotal;
        const discount = couponCode ? checkCoupon(couponCode, subtotal).amount : 0;
        const shippingCost = shippingMethods.find((method) => method.id === shippingId)?.cost ?? 0;
        const order: Order = {
          id: Math.max(...orders.map((item) => item.id)) + 1,
          date: "۵ مهر ۱۴۰۵",
          status: "pending-payment",
          items,
          shippingId,
          shippingCost,
          discount,
          addressId,
        };
        setOrders((list) => [order, ...list]);
        setCart([]);
        setCouponCode("");
        return order;
      },
      updateOrder: (id, patch) => setOrders((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item))),
      notifications,
      markRead: (id) => setNotifications((list) => list.map((item) => (item.id === id ? { ...item, unread: false } : item))),
      markAllRead: () => setNotifications((list) => list.map((item) => ({ ...item, unread: false }))),
      servicePrefill,
      startService: (prefill = {}) => {
        setServicePrefill(prefill);
        navigate("service-wizard");
      },
      payment,
      startPayment: (next) => {
        setPayment(next);
        navigate("payment-gateway");
      },
      toast,
      notice,
    };
  }, [role, techEntry, current, navigate, back, user, afterLogin, cart, couponCode, addresses, orders, notifications, servicePrefill, payment, toast, notice]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
