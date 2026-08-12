import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Clock, MapPin, Leaf, Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { rupee } from "@/data/mockData";

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export function EcoBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-eco/15 text-eco text-xs font-bold">
      <Leaf className="w-3 h-3" /> Eco
    </span>
  );
}

export function VegDot({ veg }) {
  return (
    <span className={`w-4 h-4 rounded-sm border-2 grid place-items-center ${veg ? "border-eco" : "border-destructive"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${veg ? "bg-eco" : "bg-destructive"}`} />
    </span>
  );
}

export function RestaurantCard({ r, i = 0, testIdScope = "catalog" }) {
  const { toggleSave, saved } = useApp();
  const isSaved = saved.restaurants.includes(r.id);
  return (
    <motion.div variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}
      className="group rounded-3xl bg-card border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-transform transition-shadow duration-300">
      <Link to={`/restaurant/${r.id}`} data-testid={`${testIdScope}-restaurant-${r.id}-link`}>
        <div className="relative h-44 overflow-hidden">
          <img src={r.img} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-3 left-3 flex gap-2">{r.eco && <EcoBadge />}</div>
          <button aria-label={`${isSaved ? "Unsave" : "Save"} ${r.name}`} data-testid={`${testIdScope}-restaurant-${r.id}-save-button`} onClick={(e) => { e.preventDefault(); toggleSave("restaurants", r.id); }}
            className="absolute top-3 right-3 w-9 h-9 grid place-items-center rounded-full bg-background/80 backdrop-blur hover:scale-110 transition-transform">
            <Heart className={`w-4 h-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
          </button>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 data-testid={`${testIdScope}-restaurant-${r.id}-name`} className="font-heading font-bold text-lg leading-tight">{r.name}</h3>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-eco/15 text-eco text-sm font-bold shrink-0"><Star className="w-3.5 h-3.5 fill-eco" />{r.rating}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{r.cuisine}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{r.deliveryTime}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{r.distance}</span>
          <span className="ml-auto font-semibold text-foreground">{r.priceRange}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function FoodCard({ f, i = 0, member, testIdScope = "catalog" }) {
  const { addToCart } = useApp();
  return (
    <motion.div variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}
      data-testid={`${testIdScope}-food-${f.id}-card`} className="group rounded-3xl bg-card border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-shadow duration-300">
      <div className="relative h-36 overflow-hidden">
        <img src={f.img} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-2 left-2"><VegDot veg={f.veg} /></div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-heading font-bold leading-tight">{f.name}</h4>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{f.restaurant}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{f.desc}</p>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {f.tags?.slice(0, 2).map((t) => <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">{t}</span>)}
          <span className="px-2 py-0.5 rounded-full bg-eco/15 text-eco text-[10px] font-bold flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-eco" />{f.rating}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-heading font-black text-lg">{rupee(f.price)}</span>
          <Button size="sm" data-testid={`${testIdScope}-food-${f.id}-add-button`} onClick={() => addToCart(f, member)} className="rounded-full h-8 px-3 gap-1">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function TiffinCard({ t, i = 0, testIdScope = "catalog" }) {
  const { toggleSave, saved } = useApp();
  const isSaved = saved.tiffin.includes(t.id);
  return (
    <motion.div variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}
      className="group rounded-3xl bg-card border border-border overflow-hidden hover:shadow-xl hover:shadow-eco/10 hover:-translate-y-1 transition-transform transition-shadow duration-300">
      <Link to={`/tiffin/${t.id}`} data-testid={`${testIdScope}-tiffin-${t.id}-link`}>
        <div className="relative h-40 overflow-hidden">
          <img src={t.img} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-eco text-eco-foreground text-xs font-bold">
            <Leaf className="w-3 h-3" /> Tiffin
          </span>
          <button aria-label={`${isSaved ? "Unsave" : "Save"} ${t.name}`} data-testid={`${testIdScope}-tiffin-${t.id}-save-button`} onClick={(e) => { e.preventDefault(); toggleSave("tiffin", t.id); }}
            className="absolute top-3 right-3 w-9 h-9 grid place-items-center rounded-full bg-background/80 backdrop-blur hover:scale-110 transition-transform">
            <Heart className={`w-4 h-4 ${isSaved ? "fill-eco text-eco" : ""}`} />
          </button>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-heading font-bold text-lg leading-tight">{t.name}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{t.meals} · {t.area}</p>
          </div>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-eco/15 text-eco text-sm font-bold shrink-0"><Star className="w-3.5 h-3.5 fill-eco" />{t.rating}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <VegDot veg={t.veg} />
          {t.tags.map((tag) => <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">{tag}</span>)}
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div>
            <span className="font-heading font-black text-lg">{rupee(t.monthly)}</span>
            <span className="text-xs text-muted-foreground">/month</span>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-full border-eco text-eco hover:bg-eco hover:text-eco-foreground">
            <Link to={`/tiffin/${t.id}`} data-testid={`${testIdScope}-tiffin-${t.id}-view-plans-link`}>View Plans</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function SectionHead({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-heading font-extrabold tracking-tight">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-1 text-sm md:text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
