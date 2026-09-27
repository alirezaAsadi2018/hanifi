export type Role = "customer" | "technician" | "admin";
export type Screen =
  | "home" | "store" | "product" | "service" | "technicians" | "cart"
  | "orders" | "notifications" | "profile" | "search"
  | "service-wizard" | "request-status" | "technician-detail"
  | "payment" | "payment-gateway" | "payment-success" | "payment-failure"
  | "rating" | "my-requests"
  | "technician-dashboard" | "technician-requests" | "technician-profile"
  | "admin-dashboard" | "admin-products" | "admin-technicians";

export type Navigate = (screen: Screen, id?: number) => void;
