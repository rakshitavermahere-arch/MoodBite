import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Star, MapPin, Clock, Leaf, CalendarDays, ShieldAlert, Check, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrap } from "@/components/Layout";
import { VegDot } from "@/components/Cards";
import { useApp } from "@/context/AppContext";
import { rupee } from "@/data/mockData";
import { useCatalog } from "@/context/CatalogContext";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TiffinDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { subscribe } = useApp();
  const { tiffin } = useCatalog();
  const t = tiffin.find((x) => x.id === id);
  const [plan, setPlan] = useState(t?.plans[0]);
  if (!t) return <PageWrap><p data-testid="tiffin-provider-not-found-alert">Provider not found.</p></PageWrap>;

  const finalPrice = Math.round(plan.price * (1 - plan.discount / 100));
  const days = plan.per === "week" ? 6 : plan.per === "month" ? 26 : plan.per.includes("3") ? 78 : 156;
  const perDay = Math.round(finalPrice / days);

  const doSub = async () => {
    const result = await subscribe(t, plan);
    if (result) {
      toast.info("Plan saved. It remains payment-required until verified checkout is available.");
      nav("/profile");
    }
  };

  return (
    <PageWrap>
      <button data-testid="tiffin-detail-back-button" onClick={() => nav(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="relative h-52 sm:h-64 rounded-[2rem] overflow-hidden mb-6">
        <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 text-white">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-eco text-eco-foreground text-xs font-bold mb-2"><Leaf className="w-3 h-3" /> Tiffin Provider</span>
          <h1 className="text-3xl font-heading font-black tracking-tight">{t.name}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-white/90">
            <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-current" />{t.rating}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{t.area}</span>
            <span className="flex items-center gap-1"><VegDot veg={t.veg} /> {t.veg ? "Veg" : "Veg + Non-veg"}</span>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground max-w-2xl mb-6">{t.desc}</p>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        <div>
          {/* Info chips */}
          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            {[["Meals", t.meals, CalendarDays], ["Timing", t.timing, Clock], ["Service area", t.area, MapPin]].map(([l, v, Ic]) => (
              <div key={l} className="rounded-2xl border border-border bg-card p-4">
                <Ic className="w-4 h-4 text-eco mb-2" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{l}</p>
                <p className="text-sm font-semibold mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {/* Policy */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-8 flex gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div><p className="font-heading font-bold text-sm text-amber-800">Skip / Pause policy</p><p className="text-sm text-amber-700 mt-0.5">{t.policy}</p></div>
          </div>

          {/* Weekly menu */}
          <h2 className="text-xl font-heading font-extrabold mb-4">Weekly menu</h2>
          <div className="space-y-3">
            {DAYS.map((d, i) => (
              <motion.div key={d} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                className="rounded-2xl border border-border bg-card p-4">
                <p className="font-heading font-bold mb-2">{d}</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {Object.entries(t.menu[d]).map(([meal, dish]) => (
                    <div key={meal}>
                      <p className="text-[10px] uppercase tracking-wider text-eco font-bold">{meal}</p>
                      <p className="text-sm text-muted-foreground">{dish}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Subscribe */}
        <aside className="rounded-3xl border border-border bg-card p-5 lg:sticky lg:top-20">
          <h3 className="font-heading font-bold mb-3">Choose a plan</h3>
          <div className="space-y-2.5 mb-4">
            {t.plans.map((p) => (
              <button key={p.id} data-testid={`plan-${p.id}`} onClick={() => setPlan(p)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-colors ${plan.id === p.id ? "border-eco bg-eco/5 ring-1 ring-eco" : "border-border hover:border-eco/50"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm">{p.name}</span>
                  {p.discount > 0 && <span className="flex items-center gap-0.5 text-[10px] font-bold text-eco bg-eco/15 px-2 py-0.5 rounded-full"><Percent className="w-2.5 h-2.5" />{p.discount} off</span>}
                </div>
                <p className="text-xs text-muted-foreground">{p.meals} · per {p.per}</p>
                <p className="font-bold mt-1">{rupee(Math.round(p.price * (1 - p.discount / 100)))} <span className="text-xs text-muted-foreground line-through">{p.discount > 0 ? rupee(p.price) : ""}</span></p>
              </button>
            ))}
          </div>
          <div data-testid="tiffin-selected-plan-summary" className="rounded-2xl bg-eco/5 border border-eco/20 p-4 space-y-1">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Plan price</span><span className="font-bold">{rupee(finalPrice)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Effective / day</span><span className="font-bold text-eco">{rupee(perDay)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Duration</span><span className="font-bold">{plan.per}</span></div>
          </div>
          <Button data-testid="subscribe-btn" onClick={doSub} className="w-full rounded-full h-12 mt-4 gap-2 bg-eco hover:bg-eco/90"><Check className="w-4 h-4" /> Save plan request</Button>
          <p className="text-[10px] text-center text-muted-foreground mt-2">The plan is not activated or charged until a verified payment provider confirms it.</p>
        </aside>
      </div>
    </PageWrap>
  );
}
