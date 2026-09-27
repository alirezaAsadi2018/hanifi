export type Role = "customer" | "technician" | "admin";
export type Screen =
  | "home" | "store" | "product" | "service" | "technicians" | "cart"
  | "orders" | "notifications" | "profile" | "search"
  | "technician-dashboard" | "technician-requests" | "technician-profile"
  | "admin-dashboard" | "admin-products" | "admin-technicians";

export type Navigate = (screen: Screen, productId?: number) => void;
