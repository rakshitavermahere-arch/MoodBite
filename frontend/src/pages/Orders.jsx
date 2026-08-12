import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrap } from "@/components/Layout";
import { SectionHead } from "@/components/Cards";
import { useApp } from "@/context/AppContext";
import { SAMPLE_ORDERS, rupee } from "@/data/mockData";

export default function Orders() {
  const nav = useNavigate();
  const { orders } = useApp();
  const all = [...orders.map((o) => ({ ...o, live: true })), ...SAMPLE_ORDERS];

  return (
    <PageWrap>
      <SectionHead title="Your orders" subtitle="Track live orders and revisit past favourites" />
      {all.length === 0 ? (
        <div className="text-center pt-16">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No orders yet. Let's fix that!</p>
          <Button data-testid="orders-start-ordering-button" onClick={() => nav("/")} className="rounded-full mt-4">Start ordering</Button>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {all.map((o, i) => (
            <motion.div key={o.id + i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
              <span className={`w-11 h-11 rounded-2xl grid place-items-center shrink-0 ${o.status === "Delivered" ? "bg-eco/10 text-eco" : "bg-primary/10 text-primary"}`}>
                {o.status === "Delivered" ? <CheckCircle2 className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-bold truncate">{o.restaurant || "MoodBite order"}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${o.status === "Delivered" ? "bg-eco/15 text-eco" : "bg-primary/15 text-primary"}`}>{o.status || "Confirmed"}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  #{o.id} · {(o.items || []).map((it) => (typeof it === "string" ? it : it.name)).join(", ")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{o.date || "Just now"} · {rupee(o.total)}</p>
              </div>
              {o.live && o.status !== "Delivered" && (
                <Button size="sm" data-testid={`track-order-${o.id}`} onClick={() => nav(`/track/${o.id}`)} className="rounded-full gap-1 shrink-0">Track <ChevronRight className="w-4 h-4" /></Button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </PageWrap>
  );
}
