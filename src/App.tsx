import { useState } from "react";
import { BottomNav, Footer, Header, RoleSwitcher } from "./components/Navigation";
import Icon from "./components/Icon";
import { products } from "./data/mock";
import {
  CartScreen,
  CustomerHome,
  NotificationsScreen,
  OrdersScreen,
  ProductScreen,
  ProfileScreen,
  SearchScreen,
  ServiceScreen,
  StoreScreen,
  TechniciansScreen,
} from "./screens/CustomerScreens";
import {
  AdminDashboard,
  AdminProducts,
  AdminTechnicians,
  TechnicianDashboard,
  TechnicianProfile,
  TechnicianRequests,
} from "./screens/RoleScreens";
import {
  MyRequestsScreen,
  PaymentFailureScreen,
  PaymentGatewayScreen,
  PaymentScreen,
  PaymentSuccessScreen,
  RatingScreen,
  RequestStatusScreen,
  ServiceWizardScreen,
  TechnicianDetailScreen,
} from "./screens/ServiceFlow";
import type { Role, Screen } from "./types";

export default function App() {
  const [role, setRole] = useState<Role>("customer");
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedProductId, setSelectedProductId] = useState(1);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(1);
  const [wizardPreservice, setWizardPreservice] = useState("");
  const [cart, setCart] = useState<number[]>([]);
  const [notice, setNotice] = useState("");

  const navigate = (target: Screen, id?: number) => {
    if (target === "product" && id) setSelectedProductId(id);
    if (target === "technician-detail" && id) setSelectedTechnicianId(id);
    setScreen(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuickService = (service: string) => {
    setWizardPreservice(service);
    setScreen("service-wizard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const switchRole = (nextRole: Role) => {
    setRole(nextRole);
    setScreen(
      nextRole === "customer"
        ? "home"
        : nextRole === "technician"
        ? "technician-dashboard"
        : "admin-dashboard",
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addToCart = (id: number) => {
    setCart((current) => [...current, id]);
    setNotice("محصول به سبد خرید اضافه شد");
    window.setTimeout(() => setNotice(""), 2200);
  };

  const changeQuantity = (id: number, add: boolean) => {
    if (add) setCart((current) => [...current, id]);
    else
      setCart((current) => {
        const index = current.lastIndexOf(id);
        return index < 0 ? current : current.filter((_, i) => i !== index);
      });
  };

  const selectedProduct = products.find((item) => item.id === selectedProductId) ?? products[0];
  const common = { navigate, addToCart };

  // Fullscreen screens skip the shell layout
  const fullscreenScreens: Screen[] = ["service-wizard", "payment-gateway"];
  const isFullscreen = fullscreenScreens.includes(screen);

  const renderScreen = () => {
    switch (screen) {
      case "store":
        return <StoreScreen {...common} />;
      case "product":
        return <ProductScreen {...common} product={selectedProduct} />;
      case "service":
        return <ServiceScreen navigate={navigate} />;
      case "service-wizard":
        return <ServiceWizardScreen navigate={navigate} preselectedService={wizardPreservice} />;
      case "request-status":
        return <RequestStatusScreen navigate={navigate} />;
      case "technician-detail":
        return <TechnicianDetailScreen navigate={navigate} technicianId={selectedTechnicianId} />;
      case "payment":
        return <PaymentScreen navigate={navigate} />;
      case "payment-gateway":
        return <PaymentGatewayScreen navigate={navigate} />;
      case "payment-success":
        return <PaymentSuccessScreen navigate={navigate} />;
      case "payment-failure":
        return <PaymentFailureScreen navigate={navigate} />;
      case "rating":
        return <RatingScreen navigate={navigate} />;
      case "my-requests":
        return <MyRequestsScreen navigate={navigate} />;
      case "technicians":
        return <TechniciansScreen navigate={navigate} />;
      case "cart":
        return <CartScreen cart={cart} changeQuantity={changeQuantity} navigate={navigate} />;
      case "orders":
        return <OrdersScreen navigate={navigate} />;
      case "notifications":
        return <NotificationsScreen navigate={navigate} />;
      case "profile":
        return <ProfileScreen navigate={navigate} />;
      case "search":
        return <SearchScreen {...common} />;
      case "technician-dashboard":
        return <TechnicianDashboard navigate={navigate} />;
      case "technician-requests":
        return <TechnicianRequests navigate={navigate} />;
      case "technician-profile":
        return <TechnicianProfile navigate={navigate} />;
      case "admin-dashboard":
        return <AdminDashboard navigate={navigate} />;
      case "admin-products":
        return <AdminProducts navigate={navigate} />;
      case "admin-technicians":
        return <AdminTechnicians navigate={navigate} />;
      default:
        return <CustomerHome {...common} onQuickService={handleQuickService} />;
    }
  };

  if (isFullscreen) {
    return (
      <div className="min-h-screen bg-canvas text-ink" dir="rtl">
        {renderScreen()}
        <RoleSwitcher role={role} onChange={switchRole} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink" dir="rtl">
      <Header navigate={navigate} cartCount={cart.length} role={role} />
      {renderScreen()}
      <Footer navigate={navigate} />
      {role === "customer" && <BottomNav screen={screen} navigate={navigate} />}
      <RoleSwitcher role={role} onChange={switchRole} />
      {notice && (
        <div className="toast">
          <span className="check-badge">
            <Icon name="check" size="sm" />
          </span>
          {notice}
        </div>
      )}
    </div>
  );
}
