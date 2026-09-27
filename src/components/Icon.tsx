import type { ReactNode } from "react";

export type IconName =
  | "search" | "pin" | "bell" | "bag" | "user" | "arrow" | "shield"
  | "tool" | "check" | "star" | "clock" | "close" | "pump" | "motor"
  | "gear" | "parts" | "home" | "orders" | "support" | "menu"
  | "chart" | "users" | "box" | "wallet" | "plus" | "minus" | "trash"
  | "phone" | "camera" | "print" | "filter" | "logout" | "settings" | "file"
  | "percent" | "route" | "eye" | "edit" | "lock" | "calendar" | "map" | "send" | "ban" | "pause" | "back";

const paths: Record<IconName, ReactNode> = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
  pin: <><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
  bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
  arrow: <><path d="M19 12H5M11 6l-6 6 6 6" /></>,
  // RTL "back": points right (toward where the user came from in a right-to-left flow).
  back: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  shield: <><path d="M12 22s8-3.8 8-11V5l-8-3-8 3v6c0 7.2 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  tool: <><path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 8.4 7.2 6.1 4.9a4 4 0 0 0 5 5L19 18a2 2 0 0 1-3 3l-7.8-7.9" /></>,
  check: <path d="m5 12 4 4L19 6" />, star: <path d="m12 3 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3Z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  pump: <><circle cx="10" cy="12" r="5" /><path d="M15 10h5v8h-5M5 16v3h10M10 7V4h5" /></>,
  motor: <><path d="M5 7h12v11H5zM17 10h3v5h-3M2 10h3v5H2" /><path d="M8 4h6v3M8 21h6" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></>,
  parts: <><path d="M4 7h16M7 7v10M17 7v10M4 17h16" /><circle cx="7" cy="12" r="2" /><circle cx="17" cy="12" r="2" /></>,
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
  orders: <><path d="M5 4h14v17H5zM8 8h8M8 12h8M8 16h5" /></>,
  support: <><circle cx="12" cy="12" r="9" /><path d="M8 14v-3a4 4 0 0 1 8 0v3M6 12h2v4H6zM16 12h2v4h-2z" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 19a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5" /></>,
  box: <><path d="m3 7 9-4 9 4-9 4-9-4Z" /><path d="m3 7 9 4 9-4v10l-9 4-9-4V7Z" /></>,
  wallet: <><path d="M3 6h16v14H3zM3 9h18v7h-6a3 3 0 0 1 0-6h6" /></>,
  plus: <path d="M12 5v14M5 12h14" />, minus: <path d="M5 12h14" />,
  trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" /></>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
  print: <><path d="M7 9V3h10v6M7 17H4V9h16v8h-3" /><path d="M7 14h10v7H7z" /></>,
  filter: <path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z" />,
  logout: <><path d="M10 4H5v16h5M15 8l-4 4 4 4M11 12h10" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
  file: <><path d="M14 3H6v18h12V7l-4-4Z" /><path d="M14 3v4h4M9 13h6M9 17h6" /></>,
  percent: <><path d="M19 5 5 19" /><circle cx="7" cy="7" r="2.5" /><circle cx="17" cy="17" r="2.5" /></>,
  route: <><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h8a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h8" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13 7 4 4" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
  map: <><path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" /></>,
  send: <path d="m21 3-9 18-2-8-8-2 19-8Z" />,
  ban: <><circle cx="12" cy="12" r="9" /><path d="m6 6 12 12" /></>,
  pause: <><circle cx="12" cy="12" r="9" /><path d="M10 9v6M14 9v6" /></>,
};

export default function Icon({ name, size = "md" }: { name: IconName; size?: "sm" | "md" | "lg" }) {
  return <svg className={size === "sm" ? "size-4" : size === "lg" ? "size-7" : "size-5"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
