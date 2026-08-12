import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import * as Icons from "lucide-react";
import { toast } from "sonner";
import { Leaf, Package, Award, TrendingUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { PageWrap } from "@/components/Layout";
import { SectionHead } from "@/components/Cards";
import { useApp } from "@/context/AppContext";
import { CAUSES } from "@/data/mockData";

function Counter({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const mv = { v: 0 };
    const controls = animate(0, to, { duration: 1.2, onUpdate: (v) => setVal(Math.round(v)) });
    return () => controls.stop();
  }, [to]);
  return <span>{val}{suffix}</span>;
}

export default function EcoImpact() {
  const { ecoStats } = useApp();
  const [contributed, setContributed] = useState(null);

  const stats = [
    { label: "Packaging avoided", value: ecoStats.packaging, suffix: " units", icon: Package, color: "text-eco" },
    { label: "Eco Score", value: ecoStats.score, suffix: "", icon: Award, color: "text-primary" },
    { label: "Eco Mode orders", value: ecoStats.ecoOrders, suffix: "", icon: TrendingUp, color: "text-sky-500" },
  ];

  return (
    <PageWrap>
      <div className="relative overflow-hidden rounded-[2rem] border border-eco/30 bg-eco/5 p-8 sm:p-12 mb-10">
        <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-eco/20 blur-3xl animate-blob" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-eco/15 text-eco text-xs font-bold mb-4"><Leaf className="w-3.5 h-3.5" /> Eco Impact Wallet</span>
          <h1 className="text-4xl font-heading font-black tracking-tight">Your Impact</h1>
          <p className="text-muted-foreground mt-2 max-w-lg">Every Eco Mode order reduces packaging waste. Estimated demo figures — small choices, real intent.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-5 mb-12">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            data-testid={`eco-stat-${i}`} className="rounded-3xl border border-border bg-card p-6">
            <span className={`w-11 h-11 rounded-2xl bg-muted grid place-items-center mb-4 ${s.color}`}><s.icon className="w-5 h-5" /></span>
            <p className="text-4xl font-heading font-black"><Counter to={s.value} suffix={s.suffix} /></p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <SectionHead title="Want to turn your impact into action?" subtitle="Optionally contribute to a cause. Prototype interaction — no real donations." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CAUSES.map((c, i) => {
          const Icon = Icons[c.icon] || Heart;
          const done = contributed === c.id;
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="rounded-3xl border border-border bg-card p-5 flex flex-col">
              <span className="w-11 h-11 rounded-2xl bg-eco/10 text-eco grid place-items-center mb-4"><Icon className="w-5 h-5" /></span>
              <h3 className="font-heading font-bold">{c.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 flex-1">{c.desc}</p>
              <div className="mt-4">
                <Progress value={c.raised} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{c.raised}% funded this month</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button data-testid={`contribute-${c.id}`} className={`w-full rounded-full mt-4 ${done ? "bg-eco" : ""}`} variant={done ? "default" : "outline"}>
                    {done ? "Contributed ✓" : "Contribute"}
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid={`contribution-${c.id}-dialog`} closeTestId={`contribution-${c.id}-close-button`} className="rounded-3xl max-w-sm text-center">
                  <DialogHeader>
                    <DialogTitle>Contribute to {c.title}</DialogTitle>
                    <DialogDescription>Choose a demo contribution amount. No real donation will be processed.</DialogDescription>
                  </DialogHeader>
                  <div className="flex gap-2 justify-center my-3">
                    {[10, 25, 50].map((amt) => (
                      <button key={amt} data-testid={`contribution-${c.id}-${amt}-button`} onClick={() => { setContributed(c.id); toast.success(`Thanks for supporting ${c.title}! (demo)`); }}
                        className="px-5 py-3 rounded-2xl border border-border hover:border-eco font-bold">₹{amt}</button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Prototype only — no real donation is processed.</p>
                </DialogContent>
              </Dialog>
            </motion.div>
          );
        })}
      </div>
    </PageWrap>
  );
}
