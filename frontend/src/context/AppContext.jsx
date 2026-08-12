import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { FRIENDS } from "@/data/mockData";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const load = (k, d) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; }
};

export function AppProvider({ children }) {
  const [cart, setCart] = useState(() => load("mb_cart", []));
  const [group, setGroup] = useState(() => load("mb_group", null));
  const [eco, setEco] = useState(() => load("mb_eco", true));
  const [donation, setDonation] = useState(0);
  const [subs, setSubs] = useState(() => load("mb_subs", []));
  const [orders, setOrders] = useState(() => load("mb_orders", []));
  const [saved, setSaved] = useState(() => load("mb_saved", { restaurants: [], tiffin: [] }));
  const [ecoStats, setEcoStats] = useState(() => load("mb_ecostats", { packaging: 8, score: 96, ecoOrders: 4 }));

  useEffect(() => localStorage.setItem("mb_cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("mb_group", JSON.stringify(group)), [group]);
  useEffect(() => localStorage.setItem("mb_eco", JSON.stringify(eco)), [eco]);
  useEffect(() => localStorage.setItem("mb_subs", JSON.stringify(subs)), [subs]);
  useEffect(() => localStorage.setItem("mb_orders", JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem("mb_saved", JSON.stringify(saved)), [saved]);
  useEffect(() => localStorage.setItem("mb_ecostats", JSON.stringify(ecoStats)), [ecoStats]);

  const addToCart = (item, member = "u1") => {
    setCart((c) => {
      const existing = c.find((i) => i.id === item.id && i.member === member);
      if (existing) return c.map((i) => (i.id === item.id && i.member === member ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { ...item, qty: 1, member }];
    });
    const who = group ? FRIENDS.find((f) => f.id === member)?.name : null;
    toast.success(`${item.name} added${who ? ` for ${who}` : " to cart"}`);
  };
  const updateQty = (id, member, delta) =>
    setCart((c) => c.map((i) => (i.id === id && i.member === member ? { ...i, qty: Math.max(0, i.qty + delta) } : i)).filter((i) => i.qty > 0));
  const removeItem = (id, member) => setCart((c) => c.filter((i) => !(i.id === id && i.member === member)));
  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const foodSubtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const startGroup = () => {
    const code = "MB-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    const g = { code, members: [FRIENDS[0]], settlements: {} };
    setGroup(g);
    toast.success("Group order started!");
    return g;
  };
  const joinMember = (friend) => {
    setGroup((g) => {
      if (!g || g.members.find((m) => m.id === friend.id)) return g;
      return { ...g, members: [...g.members, friend] };
    });
    toast.success(`${friend.name} joined the group`);
  };
  const setSettlement = (memberId, status) =>
    setGroup((g) => g ? ({ ...g, settlements: { ...(g.settlements || {}), [memberId]: status } }) : g);
  const endGroup = () => setGroup(null);

  const placeOrder = (order) => {
    const id = "MB" + Math.floor(2500 + Math.random() * 500);
    const o = { ...order, id, placedAt: Date.now() };
    setOrders((prev) => [o, ...prev]);
    if (eco) setEcoStats((s) => ({ packaging: s.packaging + 2, score: s.score + 12, ecoOrders: s.ecoOrders + 1 }));
    clearCart();
    return o;
  };

  const subscribe = (provider, plan) => {
    const s = { id: "sub" + Date.now(), provider: provider.name, providerId: provider.id, plan: plan.name, price: plan.price, per: plan.per, startDate: new Date().toLocaleDateString("en-IN") };
    setSubs((prev) => [s, ...prev]);
    toast.success(`Subscribed to ${provider.name} — ${plan.name}`);
    return s;
  };

  const toggleSave = (type, id) => {
    setSaved((s) => {
      const arr = s[type];
      const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
      toast.success(arr.includes(id) ? "Removed from saved" : "Saved!");
      return { ...s, [type]: next };
    });
  };

  return (
    <AppContext.Provider value={{
      cart, cartCount, foodSubtotal, addToCart, updateQty, removeItem, clearCart,
      group, startGroup, joinMember, setSettlement, endGroup,
      eco, setEco, donation, setDonation,
      subs, subscribe, orders, placeOrder, saved, toggleSave, ecoStats,
    }}>
      {children}
    </AppContext.Provider>
  );
}
