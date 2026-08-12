import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Clock, MapPin, ArrowLeft, Users, Plus, Minus, Leaf, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrap } from "@/components/Layout";
import { VegDot, EcoBadge } from "@/components/Cards";
import { useApp } from "@/context/AppContext";
import { RESTAURANTS, FOODS, rupee } from "@/data/mockData";

const REVIEWS = [
  { name: "Sneha K.", rating: 5, text: "Portions are generous and perfect for a hungry hostel night!" },
  { name: "Arjun P.", rating: 4, text: "Consistent quality and quick delivery. My go-to for group orders." },
  { name: "Meera R.", rating: 5, text: "Loved the eco packaging option. Food was warm and fresh." },
];

function QtyRow({ f }) {
  const { cart, addToCart, updateQty } = useApp();
  const inCart = cart.find((i) => i.id === f.id && i.member === "u1");
  return (
    <div className="flex items-start gap-4 py-4 border-b border-border last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <VegDot veg={f.veg} />
          <h4 className="font-heading font-bold">{f.name}</h4>
        </div>
        <p className="font-semibold text-sm mt-1">{rupee(f.price)}</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{f.desc}</p>
        <div className="flex gap-1.5 mt-2">{f.tags.map((t) => <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">{t}</span>)}</div>
      </div>
      <div className="relative w-28 h-24 rounded-2xl overflow-hidden shrink-0">
        <img src={f.img} alt={f.name} className="w-full h-full object-cover" />
        {inCart ? (
          <div className="absolute bottom-1 inset-x-2 flex items-center justify-between bg-primary text-primary-foreground rounded-full px-1 h-8">
            <button data-testid={`qty-minus-${f.id}`} onClick={() => updateQty(f.id, "u1", -1)} className="w-6 h-6 grid place-items-center"><Minus className="w-3.5 h-3.5" /></button>
            <span className="text-sm font-bold">{inCart.qty}</span>
            <button data-testid={`qty-plus-${f.id}`} onClick={() => updateQty(f.id, "u1", 1)} className="w-6 h-6 grid place-items-center"><Plus className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <button data-testid={`menu-add-${f.id}`} onClick={() => addToCart(f)}
            className="absolute bottom-1 inset-x-2 h-8 rounded-full bg-background border border-border text-primary text-sm font-bold flex items-center justify-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>
    </div>
  );
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { startGroup } = useApp();
  const r = RESTAURANTS.find((x) => x.id === id);
  const menu = FOODS.filter((f) => f.restaurantId === id);
  if (!r) return <PageWrap><p data-testid="restaurant-not-found-alert">Restaurant not found.</p></PageWrap>;
  const cats = [...new Set(menu.map((m) => m.cat))];

  const beginGroup = () => { startGroup(); nav("/group"); };

  return (
    <PageWrap>
      <button data-testid="restaurant-detail-back-button" onClick={() => nav(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="relative h-56 sm:h-72 rounded-[2rem] overflow-hidden mb-6">
        <img src={r.img} alt={r.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5 text-white flex items-end justify-between gap-4">
          <div>
            <div className="flex gap-2 mb-2">{r.eco && <EcoBadge />}</div>
            <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight">{r.name}</h1>
            <p className="text-white/85 mt-1">{r.cuisine}</p>
          </div>
          <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-eco text-eco-foreground font-bold shrink-0"><Star className="w-4 h-4 fill-current" />{r.rating}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{r.deliveryTime}</span>
        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{r.distance}</span>
        <span className="font-semibold text-foreground">{r.priceRange}</span>
        {r.eco && <span className="flex items-center gap-1 text-eco font-semibold"><Leaf className="w-4 h-4" /> Eco Mode available</span>}
      </div>
      <p className="text-muted-foreground max-w-2xl mb-6">{r.desc}</p>

      {/* Group CTA */}
      <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-5 flex flex-col sm:flex-row items-center gap-4 mb-8">
        <span className="w-12 h-12 rounded-2xl bg-primary/15 text-primary grid place-items-center shrink-0"><Users className="w-6 h-6" /></span>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-heading font-bold text-lg">Ordering with friends?</h3>
          <p className="text-sm text-muted-foreground">Start a group order — everyone adds their own items to one shared cart.</p>
        </div>
        <Button data-testid="start-group-order" onClick={beginGroup} className="rounded-full h-11 px-6 gap-2">Start Group Order <Users className="w-4 h-4" /></Button>
      </div>

      {/* Menu */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          {cats.map((cat) => (
            <section key={cat} className="mb-8">
              <h2 className="text-xl font-heading font-extrabold mb-1">{cat}</h2>
              <div className="rounded-2xl border border-border bg-card px-5">{menu.filter((m) => m.cat === cat).map((f) => <QtyRow key={f.id} f={f} />)}</div>
            </section>
          ))}
        </div>
        <aside>
          <h2 className="text-xl font-heading font-extrabold mb-3">Reviews</h2>
          <div className="space-y-3">
            {REVIEWS.map((rev, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{rev.name}</span>
                  <span className="flex items-center gap-0.5 text-eco text-sm font-bold"><Star className="w-3.5 h-3.5 fill-eco" />{rev.rating}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 flex gap-1"><Quote className="w-3.5 h-3.5 shrink-0 mt-0.5" />{rev.text}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </PageWrap>
  );
}
