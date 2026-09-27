import Icon from "./components/Icon";
import { BottomNav, Footer, Header, RoleSwitcher } from "./components/Navigation";
import { AppProvider, useApp } from "./state";
import type { Screen } from "./types";
import {
  AddressesScreen, InfoScreen, LoginScreen, NotificationSettingsScreen, NotificationsScreen, ProfileScreen, SupportScreen,
} from "./screens/AccountScreens";
import AdminPanel from "./screens/AdminPanel";
import { CustomerHome, TechniciansScreen } from "./screens/CustomerScreens";
import {
  MyRequestsScreen, PaymentFailureScreen, PaymentGatewayScreen, PaymentScreen, PaymentSuccessScreen, RatingScreen,
  RequestStatusScreen, ServiceWizardScreen, TechnicianDetailScreen,
} from "./screens/ServiceFlow";
import {
  CartScreen, CheckoutResultScreen, CheckoutScreen, InvoiceScreen, OrderDetailScreen, OrdersScreen, ProductScreen, SearchScreen, StoreScreen,
} from "./screens/ShopScreens";
import TechnicianApp from "./screens/TechnicianApp";

/** Screens that need an account: the router shows login in place and continues there afterwards. */
const protectedScreens: Screen[] = ["checkout", "orders", "order-detail", "invoice", "profile", "addresses", "notification-settings", "my-requests", "request-status", "payment", "rating"];
/** Screens that render without the store header/footer. */
const fullscreenScreens: Screen[] = ["service-wizard", "payment-gateway"];

function CustomerApp() {
  const { screen, param, user } = useApp();

  const render = () => {
    if (protectedScreens.includes(screen) && !user) return <LoginScreen stay />;
    switch (screen) {
      case "store": return <StoreScreen key={param} />;
      case "product": return <ProductScreen key={param} />;
      case "search": return <SearchScreen />;
      case "cart": return <CartScreen />;
      case "checkout": return <CheckoutScreen />;
      case "checkout-success": return <CheckoutResultScreen success />;
      case "checkout-failure": return <CheckoutResultScreen success={false} />;
      case "orders": return <OrdersScreen />;
      case "order-detail": return <OrderDetailScreen key={param} />;
      case "invoice": return <InvoiceScreen />;
      case "login": return <LoginScreen />;
      case "profile": return <ProfileScreen />;
      case "addresses": return <AddressesScreen />;
      case "notification-settings": return <NotificationSettingsScreen />;
      case "support": return <SupportScreen />;
      case "info": return <InfoScreen key={param} />;
      case "notifications": return <NotificationsScreen />;
      case "technicians": return <TechniciansScreen />;
      case "technician-detail": return <TechnicianDetailScreen key={param} />;
      case "service-wizard": return <ServiceWizardScreen />;
      case "request-status": return <RequestStatusScreen key={param} />;
      case "payment": return <PaymentScreen />;
      case "payment-gateway": return <PaymentGatewayScreen />;
      case "payment-success": return <PaymentSuccessScreen />;
      case "payment-failure": return <PaymentFailureScreen />;
      case "rating": return <RatingScreen />;
      case "my-requests": return <MyRequestsScreen />;
      default: return <CustomerHome />;
    }
  };

  if (fullscreenScreens.includes(screen)) return <div className="min-h-screen bg-canvas text-ink">{render()}</div>;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Header />
      {render()}
      <Footer />
      <BottomNav />
    </div>
  );
}

function Shell() {
  const { role, notice } = useApp();
  return (
    <>
      {role === "customer" && <CustomerApp />}
      {role === "technician" && <TechnicianApp />}
      {role === "admin" && <AdminPanel />}
      <RoleSwitcher />
      {notice && (
        <div className="toast no-print" role="status">
          <span className="check-badge"><Icon name="check" size="sm" /></span>
          {notice}
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
