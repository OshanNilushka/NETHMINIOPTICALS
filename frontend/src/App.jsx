import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/Aboutsection";
import Services from "./components/services";
import Aboutsection2 from "./components/Aboutsection2";
import Catalog from "./components/Catalog";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import CustomerDashboard from "./pages/CustomerDashboard";
import OpticianDashboard from "./pages/OpticianDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import VirtualMirror from "./pages/VirtualMirror";
import Register from "./pages/Register";
import ContactUs from "./pages/ContactUs";
import FeedbackCarousel from "./components/FeedbackCarousel";
import ServicesPage from "./pages/ServicesPage";
import Footer from "./components/Footer";

const GLASSES_CATALOG = [
  {
    id: "frame-01",
    name: "Astra Aviator",
    shape: "Aviator",
    price: "LKR 14,500",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&q=80",
    model3D: "/models/glasses_aviator_1k.glb"
  },
  {
    id: "frame-02",
    name: "Luna Round",
    shape: "Round / Oval",
    price: "LKR 12,200",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80",
    model3D: "/models/glasses_round_1k.glb"
  },
  {
    id: "frame-03",
    name: "Vertex Wayfarer",
    shape: "Rectangle",
    price: "LKR 16,000",
    image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=500&q=80",
    model3D: "/models/glasses_wayfarer_1k.glb"
  }
];

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#/catalog" || hash === "#catalog") {
        setCurrentPage("catalog");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (hash === "#/login" || hash === "#login") {
        setCurrentPage("login");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (hash === "#/signup" || hash === "#signup") {
        setCurrentPage("signup");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (hash === "#/dashboard" || hash === "#dashboard") {
        setCurrentPage("dashboard");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (hash === "#/optician-dashboard" || hash === "#optician-dashboard") {
        setCurrentPage("optician-dashboard");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (hash === "#/admin-dashboard" || hash === "#admin-dashboard") {
        setCurrentPage("admin-dashboard");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (hash === "#/virtual-mirror" || hash === "#virtual-mirror") {
        setCurrentPage("virtual-mirror");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (hash === "#/contact" || hash === "#contact") {
        setCurrentPage("contact");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (hash === "#/services" || hash === "#services") {
        setCurrentPage("services");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setCurrentPage("home");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Run once on mount

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const pathname = window.location.pathname.toLowerCase();
  const isLoginRoute = pathname === "/login";
  const isRegisterRoute = pathname === "/register";

  if (isLoginRoute) {
    return <Login />;
  }

  if (isRegisterRoute) {
    return <Register />;
  }

  return (
    <div className="app-container">
      {currentPage !== "login" && currentPage !== "signup" && currentPage !== "dashboard" && currentPage !== "optician-dashboard" && currentPage !== "admin-dashboard" && currentPage !== "virtual-mirror" && <Navbar />}
      {currentPage === "catalog" && (
        <div className="pt-18 bg-[#0f172a]">
          <Catalog />
        </div>
      )}
      {currentPage === "login" && <Login />}
      {currentPage === "signup" && <SignUp />}
      {currentPage === "dashboard" && <CustomerDashboard />}
      {currentPage === "optician-dashboard" && <OpticianDashboard />}
      {currentPage === "admin-dashboard" && <AdminDashboard />}
      {currentPage === "virtual-mirror" && <VirtualMirror />}
      {currentPage === "contact" && <ContactUs />}
      {currentPage === "services" && <ServicesPage />}
      {currentPage === "home" && (
        <>
          <div id="home">
            <HeroSection />
          </div>
          <AboutSection />
          <div id="services">
            <Services />
          </div>
          <div id="aboutsection2">
            <Aboutsection2 />
          </div>
          <FeedbackCarousel />
        </>
      )}
      {currentPage !== "login" && currentPage !== "signup" && currentPage !== "dashboard" && currentPage !== "optician-dashboard" && currentPage !== "admin-dashboard" && currentPage !== "virtual-mirror" && <Footer />}
    </div>
  );
}

export default App;