import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Bike, ChefHat, PackageCheck, MapPin, Clock, Home as HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrap } from "@/components/Layout";
import { useApp } from "@/context/AppContext";
import { rupee } from "@/data/mockData";

const STAGES = [
  { label: "Order Confirmed", icon: Check },
  { label: "Preparing", icon: ChefHat },
  { label: "Picked Up", icon: PackageCheck },
  { label: "On the Way", icon: Bike },
  { label: "Delivered", icon: HomeIcon },
];

export default function OrderTracking() {
  const { id } = useParams();
  const nav = useNavigate();
  const { orders } = useApp();
  const order = orders.find((o) => o.id === id) || orders[0];
  const [stage, setStage] = useState(1);

  useEffect(() => {
    const t = setInterval(() => setStage((s) => (s < STAGES.length - 1 ? s + 1 : s)), 3500);
    return () => clearInterval(t);
  }, []);

  if (!order) return <PageWrap><p data-testid="tracking-order-not-found-alert">Order not found.</p></PageWrap>;

  return (
    <PageWrap>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-black tracking-tight">Tracking order #{order.id}</h1>
          <p data-testid="tracking-estimated-arrival" className="text-muted-foreground mt-1 flex items-center justify-center gap-1"><Clock className="w-4 h-4" /> Estimated arrival · {stage >= 4 ? "Delivered" : "20–25 min"}</p>
        </div>

        {/* Progress */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 mb-6">
          <div className="relative">
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-muted" />
            <motion.div className="absolute left-6 top-6 w-0.5 bg-eco" initial={{ height: 0 }}
              animate={{ height: `${(stage / (STAGES.length - 1)) * 100}%` }} transition={{ duration: 0.8 }} style={{ maxHeight: "calc(100% - 3rem)" }} />
            <div className="space-y-8">
              {STAGES.map((s, i) => {
                const done = i <= stage;
                const current = i === stage;
                return (
                  <div key={s.label} className="flex items-center gap-4 relative">
                    <motion.div animate={current ? { scale: [1, 1.12, 1] } : {}} transition={{ repeat: current ? Infinity : 0, duration: 1.6 }}
                      className={`w-12 h-12 rounded-full grid place-items-center shrink-0 z-10 ${done ? "bg-eco text-eco-foreground" : "bg-muted text-muted-foreground"}`}>
                      <s.icon className="w-5 h-5" />
                    </motion.div>
                    <div>
                      <p className={`font-heading font-bold ${done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                      {current && <p data-testid="tracking-current-status" className="text-xs text-eco font-semibold">In progress…</p>}
                      {i < stage && <p className="text-xs text-muted-foreground">Completed</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <h3 className="font-heading font-bold mb-3">{order.restaurant || "MoodBite Kitchen"}</h3>
          <div className="space-y-1.5 mb-4">
            {order.items?.map((it, i) => (
              <div key={i} className="flex justify-between text-sm"><span>{it.name} × {it.qty}</span><span className="text-muted-foreground">{rupee(it.price * it.qty)}</span></div>
            ))}
          </div>
          <div className="flex justify-between font-heading font-bold text-lg pt-3 border-t border-border"><span>Total paid</span><span>{rupee(order.total)}</span></div>
          <div className="flex items-start gap-2 mt-4 text-sm text-muted-foreground"><MapPin className="w-4 h-4 mt-0.5 shrink-0" /> {order.address || "Room 214, Sunrise Hostel, Bengaluru"}</div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button data-testid="tracking-view-orders-button" variant="outline" onClick={() => nav("/orders")} className="rounded-full flex-1">View all orders</Button>
          <Button data-testid="tracking-order-again-button" onClick={() => nav("/")} className="rounded-full flex-1">Order again</Button>
        </div>
      </div>
    </PageWrap>
  );
}
