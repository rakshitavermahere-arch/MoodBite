import { useNavigate, useParams } from "react-router-dom";
import { Bike, Check, ChefHat, Clock, Home as HomeIcon, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrap } from "@/components/Layout";
import { useApp } from "@/context/AppContext";
import { rupee } from "@/data/mockData";


const STAGES = [
  { key: "confirmed", label: "Order confirmed", icon: Check },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "picked_up", label: "Picked up", icon: PackageCheck },
  { key: "on_the_way", label: "On the way", icon: Bike },
  { key: "delivered", label: "Delivered", icon: HomeIcon },
];

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders } = useApp();
  const order = orders.find((item) => (item.order_id || item.id) === id);
  if (!order) return <PageWrap><p data-testid="tracking-order-not-found-alert">Order not found.</p></PageWrap>;
  const status = String(order.status || "payment_pending").toLowerCase();
  const activeIndex = Math.max(0, STAGES.findIndex((stage) => stage.key === status));

  return (
    <PageWrap>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8"><h1 className="text-3xl font-heading font-black">Order #{id}</h1><p data-testid="tracking-current-status" className="text-muted-foreground mt-2 flex items-center justify-center gap-1"><Clock className="w-4 h-4" /> Current backend status · {status.replaceAll("_", " ")}</p></div>
        {status === "payment_pending" ? <div data-testid="tracking-payment-pending-alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-800">This order is waiting for verified payment and has not entered preparation.</div> : <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 mb-6"><div className="space-y-7">{STAGES.map((stage, index) => { const done = index <= activeIndex; const current = index === activeIndex; return <div key={stage.key} className="flex items-center gap-4"><div className={`w-12 h-12 rounded-full grid place-items-center shrink-0 ${done ? "bg-eco text-eco-foreground" : "bg-muted text-muted-foreground"}`}><stage.icon className="w-5 h-5" /></div><div><p className={`font-heading font-bold ${done ? "text-foreground" : "text-muted-foreground"}`}>{stage.label}</p>{current && <p className="text-xs text-eco font-semibold">Current status</p>}</div></div>; })}</div></div>}
        <div className="rounded-2xl border border-border bg-card p-6"><h3 className="font-heading font-bold mb-3">{order.restaurant || "MoodBite order"}</h3><div className="space-y-2 mb-4">{order.items?.map((item, index) => typeof item === "string" ? <p key={index} className="text-sm">{item}</p> : <div key={item.product_id || index} className="flex justify-between text-sm"><span>{item.name} × {item.quantity || item.qty}</span><span className="text-muted-foreground">{rupee(item.line_total || item.price * (item.quantity || item.qty))}</span></div>)}</div><div className="flex justify-between font-heading font-bold text-lg pt-3 border-t"><span>Order total</span><span>{rupee(order.amount ?? order.total)}</span></div></div>
        <div className="flex gap-3 mt-6"><Button data-testid="tracking-view-orders-button" variant="outline" onClick={() => navigate("/orders")} className="rounded-full flex-1">View orders</Button><Button data-testid="tracking-order-again-button" onClick={() => navigate("/")} className="rounded-full flex-1">Order again</Button></div>
      </div>
    </PageWrap>
  );
}
