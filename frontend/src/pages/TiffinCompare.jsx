import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrap } from "@/components/Layout";
import { SectionHead, VegDot } from "@/components/Cards";
import { TIFFIN, rupee } from "@/data/mockData";

const ROWS = [
  { key: "monthly", label: "Monthly Price", render: (t) => rupee(t.monthly) },
  { key: "meals", label: "Meals Included", render: (t) => t.meals },
  { key: "rating", label: "Rating", render: (t) => <span className="inline-flex items-center gap-1 text-eco font-bold"><Star className="w-3.5 h-3.5 fill-eco" />{t.rating}</span> },
  { key: "veg", label: "Vegetarian", render: (t) => (t.veg ? <Check className="w-4 h-4 text-eco mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />) },
  { key: "timing", label: "Delivery Timing", render: (t) => t.timing },
  { key: "flexibility", label: "Flexibility", render: (t) => t.flexibility },
  { key: "policy", label: "Pause / Skip Policy", render: (t) => t.policy },
  { key: "discount", label: "Best Discount", render: (t) => `${Math.max(...t.plans.map((p) => p.discount))}%` },
];

export default function TiffinCompare() {
  const nav = useNavigate();
  const [sel, setSel] = useState(["t1", "t2", "t3"]);
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 4 ? [...s, id] : s));
  const chosen = TIFFIN.filter((t) => sel.includes(t.id));

  return (
    <PageWrap>
      <button data-testid="tiffin-compare-back-button" onClick={() => nav(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back</button>
      <SectionHead title="Compare Tiffin Providers" subtitle="Pick up to 4 providers to compare side by side" />

      <div className="flex flex-wrap gap-2 mb-6">
        {TIFFIN.map((t) => (
          <button key={t.id} data-testid={`compare-toggle-${t.id}`} onClick={() => toggle(t.id)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${sel.includes(t.id) ? "bg-eco text-eco-foreground border-eco" : "bg-card border-border text-muted-foreground hover:border-eco"}`}>{t.name}</button>
        ))}
      </div>

      <div data-testid="tiffin-comparison-table" className="overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-bold w-44">Provider</th>
              {chosen.map((t) => (
                <th key={t.id} className="p-4 text-center">
                  <img src={t.img} alt={t.name} className="w-14 h-14 rounded-2xl object-cover mx-auto mb-2" />
                  <span className="font-heading font-bold text-sm block">{t.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, ri) => (
              <tr key={row.key} className={ri % 2 ? "bg-muted/30" : ""}>
                <td className="p-4 text-sm font-semibold text-muted-foreground">{row.label}</td>
                {chosen.map((t) => <td key={t.id} className="p-4 text-center text-sm">{row.render(t)}</td>)}
              </tr>
            ))}
            <tr>
              <td className="p-4" />
              {chosen.map((t) => (
                <td key={t.id} className="p-4 text-center"><Button size="sm" data-testid={`compare-view-${t.id}`} onClick={() => nav(`/tiffin/${t.id}`)} className="rounded-full bg-eco hover:bg-eco/90">View Plans</Button></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </PageWrap>
  );
}
