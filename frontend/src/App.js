import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "@/context/AuthContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { AppProvider } from "@/context/AppContext";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import Concierge from "@/pages/Concierge";
import Explore from "@/pages/Explore";
import RestaurantDetail from "@/pages/RestaurantDetail";
import GroupOrders from "@/pages/GroupOrders";
import GroupJoin from "@/pages/GroupJoin";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancel from "@/pages/PaymentCancel";
import OrderTracking from "@/pages/OrderTracking";
import Tiffin from "@/pages/Tiffin";
import TiffinDetail from "@/pages/TiffinDetail";
import TiffinCompare from "@/pages/TiffinCompare";
import EcoImpact from "@/pages/EcoImpact";
import Orders from "@/pages/Orders";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AuthCallback from "@/pages/AuthCallback";
import ProcessingPayment from "./pages/ProcessingPayment";


function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/login" element={<Navigate to="/login" replace />} />
      <Route path="/auth/signup" element={<Navigate to="/signup" replace />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/group/join/:code" element={<GroupJoin />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
      </Route>

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/tiffin" element={<Tiffin />} />
        <Route path="/tiffin/compare" element={<TiffinCompare />} />
        <Route path="/tiffin/:id" element={<TiffinDetail />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/concierge" element={<Concierge />} />
          <Route path="/group" element={<GroupOrders />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track/:id" element={<OrderTracking />} />
          <Route path="/eco" element={<EcoImpact />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/processing-payment" element={<ProcessingPayment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />   
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CatalogProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </CatalogProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
