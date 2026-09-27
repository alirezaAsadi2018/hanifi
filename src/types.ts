export type Role = "customer" | "technician" | "admin";
export type Screen =
  | "home" | "store" | "product" | "technicians" | "search"
  | "cart" | "checkout" | "checkout-success" | "checkout-failure"
  | "orders" | "order-detail" | "invoice"
  | "login" | "profile" | "addresses" | "notification-settings" | "support" | "info" | "notifications"
  | "service-wizard" | "request-status" | "technician-detail"
  | "payment" | "payment-gateway" | "payment-success" | "payment-failure"
  | "rating" | "my-requests";

export type Navigate = (screen: Screen, id?: number) => void;

/** Prefill for the service request wizard (from a chip, a product page or a technician profile). */
export type ServicePrefill = { service?: string; device?: string; technicianId?: number };
