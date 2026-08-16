import { useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronRight, ClipboardList, Clock3, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PageWrap } from "@/components/Layout";
import { SectionHead } from "@/components/Cards";
import { useApp } from "@/context/AppContext";
import { rupee } from "@/data/mockData";


const statusStyle = (status) => {
  if (status === "delivered" || status === "confirmed") return "bg-eco/15 text-eco";
  if (status.includes("failed") || status.includes("expired")) return "bg-destructive/10 text-destructive";
  return "bg-primary/15 text-primary";
};

export default function Orders() {
  const navigate = useNavigate();
  const { orders} = useApp();

  return (
    <PageWrap>
      <SectionHead title="Your orders" subtitle="Only backend-created and migrated order records appear here" />
      {!orders.length ? <div data-testid="orders-empty-state" className="text-center pt-16"><ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No orders yet.</p><Button data-testid="orders-start-ordering-button" onClick={() => navigate("/")} className="rounded-full mt-4">Start ordering</Button></div> : <div className="space-y-4 max-w-3xl">{orders.map((order, index) => {
        const id = order.order_id || order.id;
        const status = String(order.status || "payment_pending").toLowerCase();
        const items = (order.items || []).map((item) => typeof item === "string" ? item : item.name).join(", ");
        return <motion.div key={id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} data-testid={`order-${id}-card`} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4"><span className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 ${statusStyle(status)}`}>{status === "delivered" ? <CheckCircle2 className="w-5 h-5" /> : status.includes("failed") ? <XCircle className="w-5 h-5" /> : status === "payment_pending" ? <Clock3 className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}</span><div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><h4 className="font-heading font-bold truncate">{order.restaurant || "MoodBite order"}</h4><span data-testid={`order-${id}-status`} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle(status)}`}>{status.replaceAll("_", " ")}</span></div><p className="text-xs text-muted-foreground truncate mt-1">#{id} · {items || "Order details"}</p><p className="text-xs text-muted-foreground mt-1">{order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN") : "Migrated history"} · {rupee(order.amount ?? order.total)}</p></div>{["confirmed", "preparing", "picked_up", "on_the_way", "delivered"].includes(status) && <Button size="sm" data-testid={`track-order-${id}-button`} onClick={() => navigate(`/track/${id}`)} className="rounded-full gap-1 shrink-0">Details <ChevronRight className="w-4 h-4" /></Button>}</motion.div>;
      })}</div>}
    </PageWrap>
  );
}
