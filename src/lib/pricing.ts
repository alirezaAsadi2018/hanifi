import { discountCodes, products, VAT_RATE, type OrderItem } from "../data/mock";

export type CartLine = { productId: number; qty: number };

export function checkCoupon(code: string, subtotal: number) {
  const coupon = discountCodes.find((item) => item.code === code.trim().toUpperCase());
  if (!coupon) return { coupon: null, amount: 0, error: "کد تخفیف معتبر نیست" };
  if (subtotal < coupon.minOrder) {
    return { coupon: null, amount: 0, error: `این کد برای خرید بالای ${coupon.minOrder.toLocaleString("fa-IR")} تومان است` };
  }
  const amount = coupon.percent ? Math.round((subtotal * coupon.percent) / 100) : Math.min(coupon.fixed, subtotal);
  return { coupon, amount, error: "" };
}

/** Prices are VAT-inclusive (as shown in the store); the invoice breaks the included VAT out. */
export function orderTotals(items: OrderItem[], discount: number, shippingCost: number) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const listTotal = items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return sum + (product?.oldPrice ?? item.price) * item.qty;
  }, 0);
  const taxable = subtotal - discount;
  const vat = Math.round(taxable - taxable / (1 + VAT_RATE));
  return { subtotal, productSavings: listTotal - subtotal, discount, shippingCost, vat, total: taxable + shippingCost };
}

export const linesToItems = (lines: CartLine[]): OrderItem[] =>
  lines.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId);
    return product ? [{ productId: product.id, qty: line.qty, price: product.price }] : [];
  });
