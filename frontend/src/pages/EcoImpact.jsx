import { useEffect, useState } from "react";
import { animate, motion } from "framer-motion";
import { Award, CheckCircle2, Leaf, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { PageWrap } from "@/components/Layout";
import { SectionHead } from "@/components/Cards";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/context/AppContext";


function Counter({ to, suffix = "" }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const controls = animate(0, to, { duration: 1, onUpdate: (next) => setValue(Math.round(next)) });
    return () => controls.stop();
  }, [to]);
  return <span>{value}{suffix}</span>;
}

export default function EcoImpact() {
  const { eco, setEco, ecoStats } = useApp();
  const stats = [
    { label: "Packaging avoided", value: ecoStats.packaging, suffix: " units", icon: Package, color: "text-eco" },
    { label: "Eco Score", value: ecoStats.score, suffix: "", icon: Award, color: "text-primary" },
    { label: "Verified Eco orders", value: ecoStats.ecoOrders, suffix: "", icon: TrendingUp, color: "text-sky-600" },
  ];

  return (
    <PageWrap>
      <section className="rounded-3xl border border-eco/30 bg-eco/5 p-7 sm:p-10 mb-10 flex flex-col md:flex-row gap-8 md:items-center md:justify-between">
        <div><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-eco/15 text-eco text-xs font-bold mb-4"><Leaf className="w-3.5 h-3.5" /> Verified impact</span><h1 className="text-4xl sm:text-5xl font-heading font-black">Your Eco impact</h1><p className="text-muted-foreground mt-3 max-w-xl">Metrics update only after the payment provider confirms an Eco order. Moving a toggle alone never adds impact.</p></div>
        <div className="rounded-2xl bg-card border border-border p-5 min-w-72 flex items-center gap-4"><span className="w-11 h-11 rounded-xl bg-eco/15 text-eco grid place-items-center"><Leaf className="w-5 h-5" /></span><div className="flex-1"><p className="font-heading font-bold">Eco packaging default</p><p className="text-xs text-muted-foreground">Applied to server quotes</p></div><Switch checked={eco} onCheckedChange={setEco} data-testid="eco-mode-toggle" /></div>
      </section>

      <div className="grid sm:grid-cols-3 gap-5 mb-12">{stats.map((stat, index) => <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} data-testid={`eco-stat-${index}`} className="rounded-2xl border border-border bg-card p-6"><span className={`w-11 h-11 rounded-xl bg-muted grid place-items-center mb-4 ${stat.color}`}><stat.icon className="w-5 h-5" /></span><p className="text-4xl font-heading font-black"><Counter to={stat.value} suffix={stat.suffix} /></p><p className="text-sm text-muted-foreground mt-1">{stat.label}</p></motion.div>)}</div>

      <SectionHead title="What Eco Mode changes" subtitle="One preference, reflected through each connected part of the product." />
      <div className="grid md:grid-cols-3 gap-5">
        {[{ icon: Package, title: "Packaging", text: "Restaurants receive a reduced-packaging preference with the confirmed order." }, { icon: ShoppingBag, title: "Checkout quote", text: "The server applies the current Eco packaging credit and returns the final amount." }, { icon: CheckCircle2, title: "Verified impact", text: "Packaging and score increase only after provider-confirmed payment." }].map((item, index) => <div key={item.title} data-testid={`eco-effect-${index}`} className="rounded-2xl border border-border bg-card p-6"><item.icon className="w-5 h-5 text-eco mb-4" /><h3 className="font-heading font-bold text-lg">{item.title}</h3><p className="text-sm text-muted-foreground mt-2">{item.text}</p></div>)}
      </div>
    </PageWrap>
  );
}
