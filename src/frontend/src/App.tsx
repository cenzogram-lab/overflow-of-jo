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
import LoadingScreen from "./components/loading/LoadingScreen";
import { dismissBootSplash } from "./components/loading/bootSplash";
import {
  SiteContentProvider,
  useSiteContent,
} from "./contexts/SiteContentContext";
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

function PublicSite() {
  const { isReady, progress } = useSiteContent();

  return (
    <>
      <LoadingScreen active={!isReady} progress={progress} />
      {/* Veiled until the admin config and critical artwork resolve, so the
          bundled fallback copy and imagery never flash into view. */}
      <div
        className={`min-h-screen bg-background transition-opacity duration-500 ease-out ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!isReady}
        inert={!isReady}
      >
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
    </>
  );
}

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    // Runs after the first commit, so whatever this route renders is already
    // in the DOM before the static splash goes away.
    dismissBootSplash();

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
    <SiteContentProvider>
      <PublicSite />
    </SiteContentProvider>
  );
}
