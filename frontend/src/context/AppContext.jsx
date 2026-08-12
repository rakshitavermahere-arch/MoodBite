import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { SAMPLE_ORDERS } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { api, apiError } from "@/lib/api";


const AppContext = createContext(null);

const readLocal = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};

export function AppProvider({ children }) {
  const { authenticated, user } = useAuth();
  const [cart, setCart] = useState([]);
  const [group, setGroup] = useState(null);
  const [eco, setEcoState] = useState(true);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [saved, setSaved] = useState({ restaurants: [], tiffin: [] });
  const [ecoStats, setEcoStats] = useState({ packaging: 0, score: 0, ecoOrders: 0 });
  const [loading, setLoading] = useState(false);

  const applyState = useCallback((data) => {
    setCart((data.cart || []).map((item) => ({ ...item, qty: item.quantity })));
    setOrders(data.orders || []);
    setSubscriptions(data.subscriptions || []);
    setSaved(data.saved || { restaurants: [], tiffin: [] });
    setEcoState(data.eco ?? true);
    setEcoStats(data.eco_stats || { packaging: 0, score: 0, ecoOrders: 0 });
  }, []);

  useEffect(() => {
    if (!authenticated || !user) {
      applyState({});
      setGroup(null);
      return;
    }
    let active = true;
    const migrate = async () => {
      setLoading(true);
      const snapshot = {
        cart: readLocal("mb_cart", []),
        saved: readLocal("mb_saved", { restaurants: [], tiffin: [] }),
        eco: readLocal("mb_eco", true),
        eco_stats: readLocal("mb_eco_stats", { packaging: 0, score: 0, ecoOrders: 0 }),
        subscriptions: readLocal("mb_subs", []),
        orders: [...readLocal("mb_orders", []), ...SAMPLE_ORDERS],
      };
      try {
        const [{ data: state }, { data: currentGroup }] = await Promise.all([
          api.post("/app-state/migrate", snapshot),
          api.get("/groups/current"),
        ]);
        if (active) { applyState(state); setGroup(currentGroup); }
        localStorage.setItem(`mb_migrated_${user.user_id}`, "true");
      } catch (error) {
        if (active) toast.error(apiError(error, "Your MoodBite data could not be synchronized."));
      } finally {
        if (active) setLoading(false);
      }
    };
    migrate();
    return () => { active = false; };
  }, [authenticated, user, applyState]);

  const requireAccount = () => {
    if (authenticated) return true;
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/login?next=${encodeURIComponent(next)}`);
    return false;
  };

  const addToCart = async (item) => {
    if (!requireAccount()) return;
    try {
      const { data } = await api.post("/cart/items", { product_id: item.id, quantity: 1 });
      applyState(data);
      toast.success(`${item.name} added to your cart`);
    } catch (error) {
      toast.error(apiError(error, "Could not add this item."));
    }
  };

  const updateQty = async (id, _member, delta) => {
    const item = cart.find((entry) => entry.id === id);
    if (!item) return;
    try {
      const { data } = await api.patch(`/cart/items/${id}`, { quantity: Math.max(0, item.qty + delta) });
      applyState(data);
    } catch (error) {
      toast.error(apiError(error, "Could not update quantity."));
    }
  };

  const removeItem = async (id) => {
    try {
      const { data } = await api.delete(`/cart/items/${id}`);
      applyState(data);
      toast.success("Item removed");
    } catch (error) {
      toast.error(apiError(error, "Could not remove this item."));
    }
  };

  const clearCart = async () => {
    try {
      const { data } = await api.delete("/cart");
      applyState(data);
    } catch (error) {
      toast.error(apiError(error, "Could not clear the cart."));
    }
  };

  const toggleSave = async (type, id) => {
    if (!requireAccount()) return;
    try {
      const { data } = await api.post("/saved/toggle", { item_type: type, item_id: id });
      applyState(data);
    } catch (error) {
      toast.error(apiError(error, "Could not update saved items."));
    }
  };

  const setEco = async (enabled) => {
    if (!requireAccount()) return;
    setEcoState(enabled);
    try {
      const { data } = await api.put("/preferences/eco", { enabled });
      applyState(data);
    } catch (error) {
      setEcoState(!enabled);
      toast.error(apiError(error, "Could not update Eco Mode."));
    }
  };

  const subscribe = async (provider, plan) => {
    if (!requireAccount()) return null;
    try {
      const { data } = await api.post("/subscriptions", { provider_id: provider.id, plan_id: plan.id });
      applyState(data.state);
      return data.subscription;
    } catch (error) {
      toast.error(apiError(error, "Could not save this subscription request."));
      return null;
    }
  };

  const cancelSubscription = async (subscriptionId) => {
    try {
      const { data } = await api.delete(`/subscriptions/${subscriptionId}`);
      applyState(data);
      toast.success("Subscription request cancelled");
    } catch (error) {
      toast.error(apiError(error, "Could not cancel this subscription request."));
    }
  };

  const startGroup = async (name = "Campus food run") => {
    if (!requireAccount()) return null;
    try {
      const { data } = await api.post("/groups", { name, origin_url: window.location.origin });
      setGroup(data);
      return data;
    } catch (error) {
      toast.error(apiError(error, "Could not create the group order."));
      return null;
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const value = {
    cart, cartCount, subtotal, addToCart, updateQty, removeItem, clearCart,
    group, setGroup, startGroup,
    eco, setEco, donation: 0, setDonation: () => toast.info("Contributions will open when a verified payment provider is available."),
    orders, subscriptions, subscribe, cancelSubscription,
    saved, toggleSave,
    ecoStats, loading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used within AppProvider");
  return value;
}
