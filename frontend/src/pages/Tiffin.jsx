import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GitCompare, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrap } from "@/components/Layout";
import { TiffinCard, SectionHead } from "@/components/Cards";
import { IMG } from "@/data/mockData";
import { useCatalog } from "@/context/CatalogContext";

const MEAL_FILTERS = ["All", "Breakfast", "Lunch", "Dinner", "Full-day"];

export default function Tiffin() {
  const nav = useNavigate();
  const { tiffin } = useCatalog();
  const [filter, setFilter] = useState("All");
  const [vegOnly, setVegOnly] = useState(false);

  const list = tiffin.filter((t) => {
    if (vegOnly && !t.veg) return false;
    if (filter === "All") return true;
    if (filter === "Full-day") return t.meals.split("+").length >= 3;
    return t.meals.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <PageWrap>
      <div className="relative overflow-hidden rounded-[2rem] border border-border mb-10">
        <img src={IMG.tiffinEco} alt="Tiffin" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-eco/90 via-eco/70 to-transparent" />
        <div className="relative p-8 sm:p-12 max-w-lg text-white">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur text-xs font-bold mb-4"><Leaf className="w-3.5 h-3.5" /> Daily Tiffin Marketplace</span>
          <h1 className="text-4xl font-heading font-black tracking-tight">Daily Tiffin</h1>
          <p className="mt-3 text-white/90">Home-style meals without the daily hassle. Discover, compare and subscribe to local tiffin providers & home chefs.</p>
          <Button data-testid="compare-cta" onClick={() => nav("/tiffin/compare")} className="mt-5 rounded-full h-11 px-6 gap-2 bg-white text-eco hover:bg-white/90"><GitCompare className="w-4 h-4" /> Compare providers</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {MEAL_FILTERS.map((m) => (
          <button key={m} data-testid={`tiffin-filter-${m.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} onClick={() => setFilter(m)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${filter === m ? "bg-eco text-eco-foreground border-eco" : "bg-card border-border text-muted-foreground hover:border-eco"}`}>{m}</button>
        ))}
        <button onClick={() => setVegOnly((v) => !v)} data-testid="tiffin-veg-only"
          className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ml-auto ${vegOnly ? "bg-eco text-eco-foreground border-eco" : "bg-card border-border text-muted-foreground hover:border-eco"}`}>Pure Veg</button>
      </div>

      <div data-testid="tiffin-provider-count"><SectionHead title={`${list.length} providers near you`} /></div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {list.map((t, i) => <TiffinCard key={t.id} t={t} i={i} testIdScope="tiffin" />)}
      </div>
    </PageWrap>
  );
}
