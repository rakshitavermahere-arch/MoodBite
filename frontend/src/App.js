import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar, BottomNav, Footer } from "@/components/Layout";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import RestaurantDetail from "@/pages/RestaurantDetail";
import Concierge from "@/pages/Concierge";
import GroupOrders from "@/pages/GroupOrders";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderTracking from "@/pages/OrderTracking";
import Tiffin from "@/pages/Tiffin";
import TiffinDetail from "@/pages/TiffinDetail";
import TiffinCompare from "@/pages/TiffinCompare";
import EcoImpact from "@/pages/EcoImpact";
import Orders from "@/pages/Orders";
import Profile from "@/pages/Profile";

function App() {
  return (
    <div className="App min-h-screen flex flex-col">
      <BrowserRouter>
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
            <Route path="/concierge" element={<Concierge />} />
            <Route path="/group" element={<GroupOrders />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track/:id" element={<OrderTracking />} />
            <Route path="/tiffin" element={<Tiffin />} />
            <Route path="/tiffin/compare" element={<TiffinCompare />} />
            <Route path="/tiffin/:id" element={<TiffinDetail />} />
            <Route path="/eco" element={<EcoImpact />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
        <Footer />
        <BottomNav />
      </BrowserRouter>
    </div>
  );
}

export default App;
