import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, Star, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PageWrap } from "@/components/Layout";
import { RestaurantCard, FoodCard, SectionHead } from "@/components/Cards";
import { useCatalog } from "@/context/CatalogContext";

const CUISINES = ["All", "North Indian", "Chinese", "South Indian", "Pizza", "Cafe", "Biryani", "Home-style"];
const FILTERS = [
  { id: "veg", label: "Pure Veg" },
  { id: "eco", label: "Eco-friendly" },
  { id: "popular", label: "Popular" },
  { id: "u150", label: "Under ₹150" },
  { id: "u250", label: "Under ₹250" },
  { id: "rating", label: "4.5+ Rated" },
];

export default function Explore() {
  const { restaurants: catalogRestaurants, foods: catalogFoods } = useCatalog();
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [active, setActive] = useState([]);
  const toggle = (id) => setActive((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const suggestions = useMemo(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    const f = catalogFoods.filter((x) => x.name.toLowerCase().includes(s)).slice(0, 5).map((x) => ({ type: "food", label: x.name, sub: x.restaurant, to: `/restaurant/${x.restaurantId}` }));
    const r = catalogRestaurants.filter((x) => x.name.toLowerCase().includes(s) || x.cuisine.toLowerCase().includes(s)).slice(0, 3).map((x) => ({ type: "restaurant", label: x.name, sub: x.cuisine, to: `/restaurant/${x.id}` }));
    return [...f, ...r].slice(0, 7);
  }, [q, catalogFoods, catalogRestaurants]);

  const restaurants = useMemo(() => {
    return catalogRestaurants.filter((r) => {
      if (cuisine !== "All" && !r.cuisine.toLowerCase().includes(cuisine.toLowerCase()) && !(cuisine === "Cafe" && r.cuisine.includes("Cafe")) && !(cuisine === "Home-style" && r.cuisine.includes("Home"))) return false;
      if (active.includes("eco") && !r.eco) return false;
      if (active.includes("popular") && !r.tags.includes("Popular")) return false;
      if (active.includes("rating") && r.rating < 4.5) return false;
      if (q.trim() && !r.name.toLowerCase().includes(q.toLowerCase()) && !r.cuisine.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [catalogRestaurants, cuisine, active, q]);

  const foods = useMemo(() => {
    return catalogFoods.filter((f) => {
      if (active.includes("veg") && !f.veg) return false;
      if (active.includes("u150") && f.price > 150) return false;
      if (active.includes("u250") && f.price > 250) return false;
      if (active.includes("rating") && f.rating < 4.5) return false;
      if (q.trim() && !f.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [catalogFoods, active, q]);

  const foodFiltersOn = active.some((a) => ["veg", "u150", "u250"].includes(a)) || q.trim();

  return (
    <PageWrap>
      <SectionHead title="Explore" subtitle="Discover restaurants and dishes around your campus" />

      {/* Search */}
      <div className="relative max-w-xl mb-6">
        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 focus-within:ring-2 ring-primary/40">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} data-testid="explore-search"
            placeholder="Search dishes, restaurants, cuisines…" className="flex-1 bg-transparent outline-none py-3 text-sm" />
          {q && <button aria-label="Clear search" data-testid="explore-clear-search-button" onClick={() => setQ("")}><X className="w-4 h-4 text-muted-foreground" /></button>}
        </div>
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute z-30 mt-2 w-full rounded-2xl border border-border bg-popover shadow-xl overflow-hidden">
              {suggestions.map((s, i) => (
                <Link key={i} to={s.to} onClick={() => setQ("")} data-testid={`explore-search-suggestion-${i}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <div><p className="text-sm font-semibold">{s.label}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">{s.type}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cuisine chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-3">
        {CUISINES.map((c) => (
          <button key={c} data-testid={`cuisine-${c.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} onClick={() => setCuisine(c)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${cuisine === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary"}`}>{c}</button>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground font-semibold pr-1"><SlidersHorizontal className="w-4 h-4" /> Filters:</span>
        {FILTERS.map((f) => (
          <button key={f.id} data-testid={`filter-${f.id}`} onClick={() => toggle(f.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${active.includes(f.id) ? "bg-eco text-eco-foreground border-eco" : "bg-card border-border text-muted-foreground hover:border-eco"}`}>{f.label}</button>
        ))}
        {active.length > 0 && <button data-testid="explore-clear-filters-button" onClick={() => setActive([])} className="text-xs text-primary font-semibold underline">Clear</button>}
      </div>

      {foodFiltersOn && (
        <section className="mb-12">
          <SectionHead title={`Dishes (${foods.length})`} subtitle="Matching your filters" />
          {foods.length ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">{foods.map((f, i) => <FoodCard key={f.id} f={f} i={i} testIdScope="explore" />)}</div>
          ) : <p data-testid="explore-no-dishes-alert" className="text-muted-foreground">No dishes match. Try adjusting filters.</p>}
        </section>
      )}

      <section>
        <SectionHead title={`Restaurants (${restaurants.length})`} />
        {restaurants.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{restaurants.map((r, i) => <RestaurantCard key={r.id} r={r} i={i} testIdScope="explore" />)}</div>
        ) : <p data-testid="explore-no-restaurants-alert" className="text-muted-foreground">No restaurants match your filters.</p>}
      </section>
    </PageWrap>
  );
}
