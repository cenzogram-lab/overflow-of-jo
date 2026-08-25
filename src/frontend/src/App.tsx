import { useEffect, useState } from "react";
import About from "./components/About";
import EventsBooking from "./components/EventsBooking";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import Navigation from "./components/Navigation";
import PrayItForward from "./components/PrayItForward";
import Scripture from "./components/Scripture";
import SocialMedia from "./components/SocialMedia";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

function AdminRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("admin_session") === "authenticated";
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_session");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    const checkRoute = () => {
      setIsAdminRoute(
        window.location.pathname === "/admin" ||
          window.location.pathname === "/admin/",
      );
    };
    checkRoute();
    window.addEventListener("popstate", checkRoute);
    return () => window.removeEventListener("popstate", checkRoute);
  }, []);

  if (isAdminRoute) {
    return <AdminRoute />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero />
        <About />
        <Menu />
        <EventsBooking />
        <PrayItForward />
        <Scripture />
        <SocialMedia />
      </main>
      <Footer />
    </div>
  );
}
