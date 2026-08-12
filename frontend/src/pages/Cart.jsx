import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Plus, Minus, Trash2, Leaf, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageWrap } from "@/components/Layout";
import { SectionHead, VegDot } from "@/components/Cards";
import { useApp } from "@/context/AppContext";
import { FRIENDS, rupee } from "@/data/mockData";

const DONATIONS = [0, 5, 10, 20];

export default function Cart() {
  const nav = useNavigate();
  const { cart, updateQty, removeItem, foodSubtotal, eco, setEco, donation, setDonation, group } = useApp();

  if (cart.length === 0) {
    return (
      <PageWrap>
        <div className="max-w-md mx-auto text-center pt-16">
          <span className="w-16 h-16 rounded-3xl bg-muted grid place-items-center mx-auto mb-5"><ShoppingBag className="w-8 h-8 text-muted-foreground" /></span>
          <h1 className="text-2xl font-heading font-black">Your cart is empty</h1>
          <p className="text-muted-foreground mt-2">Ask the AI concierge or explore restaurants to add something tasty.</p>
          <div className="flex gap-3 justify-center mt-6">
            <Button data-testid="empty-cart-concierge-button" onClick={() => nav("/concierge")} className="rounded-full">Ask MoodBite</Button>
            <Button data-testid="empty-cart-explore-button" variant="outline" onClick={() => nav("/explore")} className="rounded-full">Explore</Button>
          </div>
        </div>
      </PageWrap>
    );
  }

  const delivery = 29;
  const ecoDiscount = eco ? 10 : 0;
  const taxes = Math.round(foodSubtotal * 0.05);
  const total = foodSubtotal + delivery + taxes + donation - ecoDiscount;
  const memberName = (id) => FRIENDS.find((f) => f.id === id)?.name || "You";

  return (
    <PageWrap>
      <SectionHead title="Your cart" subtitle={group ? `Group order · ${group.code}` : "Review your items before checkout"} />
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-3">
          {cart.map((i) => (
            <motion.div layout key={i.id + i.member} data-testid={`cart-item-${i.id}-${i.member}`} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3">
              <img src={i.img} alt={i.name} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><VegDot veg={i.veg} /><h4 className="font-heading font-bold truncate">{i.name}</h4></div>
                <p className="text-xs text-muted-foreground">{i.restaurant}{group && ` · for ${memberName(i.member)}`}</p>
                <p className="font-bold text-sm mt-1">{rupee(i.price)}</p>
              </div>
              <div className="flex items-center gap-2 bg-muted rounded-full px-1 h-9">
                <button aria-label={`Decrease ${i.name}`} data-testid={`cart-minus-${i.id}-${i.member}`} onClick={() => updateQty(i.id, i.member, -1)} className="w-7 h-7 grid place-items-center"><Minus className="w-4 h-4" /></button>
                <span data-testid={`cart-quantity-${i.id}-${i.member}`} className="text-sm font-bold w-4 text-center">{i.qty}</span>
                <button aria-label={`Increase ${i.name}`} data-testid={`cart-plus-${i.id}-${i.member}`} onClick={() => updateQty(i.id, i.member, 1)} className="w-7 h-7 grid place-items-center"><Plus className="w-4 h-4" /></button>
              </div>
              <button aria-label={`Remove ${i.name}`} data-testid={`cart-remove-${i.id}-${i.member}`} onClick={() => removeItem(i.id, i.member)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </motion.div>
          ))}

          {/* Eco */}
          <div className="rounded-2xl border border-eco/30 bg-eco/5 p-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-eco/15 text-eco grid place-items-center"><Leaf className="w-5 h-5" /></span>
            <div className="flex-1">
              <p className="font-heading font-bold text-sm">Eco Mode</p>
              <p className="text-xs text-muted-foreground">{eco ? "Reduced-packaging delivery · saves ~2 units · Eco Score +12" : "Enable reduced-packaging delivery"}</p>
            </div>
            <Switch checked={eco} onCheckedChange={setEco} data-testid="cart-eco-toggle" />
          </div>

          {/* Donation */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3"><Heart className="w-4 h-4 text-primary" /><p className="font-heading font-bold text-sm">Round up for a cause</p></div>
            <div className="flex gap-2">
              {DONATIONS.map((d) => (
                <button key={d} data-testid={`donate-${d}`} onClick={() => setDonation(d)}
                  className={`flex-1 py-2 rounded-full text-sm font-bold border transition-colors ${donation === d ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>
                  {d === 0 ? "None" : rupee(d)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-3xl border border-border bg-card p-5 lg:sticky lg:top-20 h-fit">
          <h3 className="font-heading font-bold mb-4">Bill details</h3>
          {[["Item total", foodSubtotal], ["Delivery fee", delivery], ["Taxes & charges", taxes]].map(([l, v]) => (
            <div key={l} className="flex justify-between text-sm py-1 text-muted-foreground"><span>{l}</span><span>{rupee(v)}</span></div>
          ))}
          {eco && <div className="flex justify-between text-sm py-1 text-eco"><span>Eco Mode discount</span><span>- {rupee(ecoDiscount)}</span></div>}
          {donation > 0 && <div className="flex justify-between text-sm py-1 text-primary"><span>Donation</span><span>{rupee(donation)}</span></div>}
          <div data-testid="cart-total" className="flex justify-between font-heading font-black text-lg pt-3 mt-2 border-t border-border"><span>To pay</span><span>{rupee(total)}</span></div>
          <Button data-testid="proceed-checkout-btn" onClick={() => nav("/checkout")} className="w-full rounded-full h-12 mt-4 gap-2">Proceed to Checkout <ArrowRight className="w-4 h-4" /></Button>
          <p className="text-[10px] text-center text-muted-foreground mt-3">Demo Mode — no real payment is processed.</p>
        </aside>
      </div>
    </PageWrap>
  );
}
