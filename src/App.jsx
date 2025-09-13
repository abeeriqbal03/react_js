import React from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import About from "./pages/common/About.jsx";
import Contact from "./pages/common/Contact.jsx";
import Emergency from "./pages/common/Emergency.jsx";
import Feedback from "./pages/common/Feedback.jsx";
import Home from "./pages/Home.jsx";
import Cart from "./pages/owner/Cart.jsx";
import OwnerFeeding from "./pages/owner/Feeding.jsx";
import OwnerGrooming from "./pages/owner/Grooming.jsx";
import OwnerHealth from "./pages/owner/Health.jsx";
import OwnerProducts from "./pages/owner/Products.jsx";
import OwnerProfile from "./pages/owner/Profile.jsx";
import OwnerTraining from "./pages/owner/Training.jsx";
import AdoptionForm from "./pages/shelter/AdoptionForm.jsx";
import ShelterAdoptions from "./pages/shelter/Adoptions.jsx";
import ShelterContact from "./pages/shelter/Contact.jsx";
import ShelterEvents from "./pages/shelter/Events.jsx";
import ShelterStories from "./pages/shelter/Stories.jsx";
import VetAppointments from "./pages/vet/Appointments.jsx";
import VetDashboard from "./pages/vet/VetDashboard.jsx";
import VetForm from "./pages/vet/VetForm.jsx";
import { get, set } from "./utils.js";
export const AppCtx = React.createContext(null);

const MENU = {
  owner: [
    ["owner/profile", "Pet Profile"],
    ["owner/feeding", "Feeding"],
    ["owner/grooming", "Grooming"],
    ["owner/health", "Health"],
    ["owner/training", "Training"],
    ["owner/products", "Products"],

    ["emergency", "Emergency"],
    ["feedback", "Feedback"],
    ["contact", "Contact"],
    ["about", "About"],
  ],
  vet: [
    ["vet/register", "Register Vet"],
    ["vet/dashboard", "Dashboard"],
    ["vet/appointments", "Appointments"],
    ["emergency", "Emergency"],
    ["about", "About"],
  ],
  shelter: [
    ["shelter/adoptions", "Adoptable Pets"],
    ["shelter/adopt", "Adoption Form"],
    ["shelter/stories", "Stories"],
    ["shelter/events", "Events"],
    ["shelter/contact", "Contact"],
    ["about", "About"],
  ],
};

function Navbar() {
  const { userType, username, cart } = React.useContext(AppCtx);
  const loc = useLocation();
  const items = MENU[userType] || [];
  React.useEffect(() => {
    const el = document.getElementById("clock");
    const id = setInterval(() => {
      if (el) el.textContent = new Date().toLocaleString();
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <header className="border-bottom bg-white sticky-top shadow-sm">
      <nav className="navbar navbar-expand-lg container">
        <Link className="navbar-brand fw-bold" to="/">
          FurEver <span>Care</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbars"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbars">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {items.map(([k, label]) => (
              <li className="nav-item" key={k}>
                <Link
                  className={
                    "nav-link" + (loc.pathname.includes(k) ? " active" : "")
                  }
                  to={"/" + k}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="d-flex align-items-center gap-3">
            <Link to="/owner/cart" className="btn btn-sm btn-outline-primary">
              Cart ({cart.length})
            </Link>
            <span className="small text-muted" id="clock">
              --:--
            </span>
          </div>
        </div>
      </nav>
      <div className="ticker bg-light py-1 border-top">
        <div className="container small text-muted">
          {/* <span>
            Welcome to FurEver Care • Karachi heat-safety tips • Events updated
          </span> */}
        </div>
      </div>
    </header>
  );
}
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-top py-4 mt-5">
      <div className="container d-flex justify-content-between align-items-center">
        <div className="text-muted small">© {year} FurEver Care</div>
        <div className="small">
          <Link to="/about" className="me-3">
            About
          </Link>
          <Link to="/contact" className="me-3">
            Contact
          </Link>
          <Link to="/feedback">Feedbacks</Link>
        </div>
      </div>
    </footer>
  );
}
export default function App() {
  const [userType, setUserType] = React.useState(get("fec_userType", "owner"));
  const [username, setUsername] = React.useState(get("fec_username", ""));
  const [petName, setPetName] = React.useState(get("fec_petName", ""));
  const [cart, setCart] = React.useState(get("fec_cart", []));
  const [bookings, setBookings] = React.useState(get("fec_bookings", []));
  const [adoptions, setAdoptions] = React.useState(get("fec_adoptions", []));
  const [feedbacks, setFeedbacks] = React.useState(get("fec_feedbacks", []));
  React.useEffect(() => set("fec_userType", userType), [userType]);
  React.useEffect(() => set("fec_username", username), [username]);
  React.useEffect(() => set("fec_petName", petName), [petName]);
  React.useEffect(() => set("fec_cart", cart), [cart]);
  React.useEffect(() => set("fec_bookings", bookings), [bookings]);
  React.useEffect(() => set("fec_adoptions", adoptions), [adoptions]);
  React.useEffect(() => set("fec_feedbacks", feedbacks), [feedbacks]);
  const addToCart = (i) => setCart((p) => [...p, i]);
  const removeFromCart = (i) => setCart((p) => p.filter((_, x) => x !== i));
  const clearCart = () => setCart([]);
  const bookSlot = (slot, date) =>
    setBookings((p) => [...p, { slot, date, when: new Date().toISOString() }]);
  const cancelBooking = (i) => setBookings((p) => p.filter((_, x) => x !== i));
  const submitAdoption = (f) =>
    setAdoptions((p) => [...p, { ...f, when: new Date().toISOString() }]);
  const deleteAdoption = (i) =>
    setAdoptions((p) => p.filter((_, x) => x !== i));
  const submitFeedback = (f) =>
    setFeedbacks((p) => [...p, { ...f, when: new Date().toISOString() }]);
  const deleteFeedback = (i) =>
    setFeedbacks((p) => p.filter((_, x) => x !== i));
  const ctx = React.useMemo(
    () => ({
      userType,
      setUserType,
      username,
      setUsername,
      petName,
      setPetName,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      bookings,
      bookSlot,
      cancelBooking,
      adoptions,
      submitAdoption,
      deleteAdoption,
      feedbacks,
      submitFeedback,
      deleteFeedback,
    }),
    [userType, username, petName, cart, bookings, adoptions, feedbacks]
  );
  return (
    <AppCtx.Provider value={ctx}>
      <Navbar />
      <main className="container my-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/owner/profile" element={<OwnerProfile />} />
          <Route path="/owner/feeding" element={<OwnerFeeding />} />
          <Route path="/owner/grooming" element={<OwnerGrooming />} />
          <Route path="/owner/health" element={<OwnerHealth />} />
          <Route path="/owner/training" element={<OwnerTraining />} />
          <Route path="/owner/products" element={<OwnerProducts />} />
          <Route path="/owner/cart" element={<Cart />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/vet/register" element={<VetForm />} />
          <Route path="/vet/dashboard" element={<VetDashboard />} />
          <Route path="/vet/appointments" element={<VetAppointments />} />
          <Route path="/shelter/adoptions" element={<ShelterAdoptions />} />
          <Route path="/shelter/adopt" element={<AdoptionForm />} />
          <Route path="/shelter/stories" element={<ShelterStories />} />
          <Route path="/shelter/events" element={<ShelterEvents />} />
          <Route path="/shelter/contact" element={<ShelterContact />} />
        </Routes>
      </main>
      <Footer />
    </AppCtx.Provider>
  );
}
