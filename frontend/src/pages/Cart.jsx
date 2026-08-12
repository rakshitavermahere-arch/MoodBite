import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Leaf, Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageWrap } from "@/components/Layout";
import { SectionHead, VegDot } from "@/components/Cards";
import { FallbackImage } from "@/components/FallbackImage";
import { useApp } from "@/context/AppContext";
import { api, apiError } from "@/lib/api";
import { rupee } from "@/data/mockData";


export default function Cart() {
  const navigate = useNavigate();
  const { cart, updateQty, removeItem, eco, setEco } = useApp();
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState("");

  useEffect(() => {
    if (!cart.length) { setQuote(null); return; }
    let active = true;
    api.post("/checkout/quote", { group_id: null })
      .then(({ data }) => { if (active) { setQuote(data); setQuoteError(""); } })
      .catch((error) => { if (active) setQuoteError(apiError(error, "Totals could not be verified.")); });
    return () => { active = false; };
  }, [cart, eco]);

  if (cart.length === 0) {
    return <PageWrap><div className="max-w-md mx-auto text-center pt-16"><span className="w-16 h-16 rounded-3xl bg-muted grid place-items-center mx-auto mb-5"><ShoppingBag className="w-8 h-8 text-muted-foreground" /></span><h1 className="text-2xl font-heading font-black">Your cart is empty</h1><p className="text-muted-foreground mt-2">Ask the AI concierge or explore restaurants to add something tasty.</p><div className="flex gap-3 justify-center mt-6"><Button data-testid="empty-cart-concierge-button" onClick={() => navigate("/concierge")} className="rounded-full">Ask MoodBite</Button><Button data-testid="empty-cart-explore-button" variant="outline" onClick={() => navigate("/explore")} className="rounded-full">Explore</Button></div></div></PageWrap>;
  }

  return (
    <PageWrap>
      <SectionHead title="Your cart" subtitle="Your selections are saved to your MoodBite account" />
      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-8">
        <div className="space-y-3">
          {cart.map((item) => <motion.div layout key={item.id} data-testid={`cart-item-${item.id}`} className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-border bg-card p-3"><FallbackImage src={item.img} alt={item.name} testId={`cart-item-${item.id}-image`} className="w-16 h-16 rounded-xl object-cover shrink-0" /><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><VegDot veg={item.veg} /><h4 className="font-heading font-bold truncate">{item.name}</h4></div><p className="text-xs text-muted-foreground truncate">{item.restaurant}</p><p className="font-bold text-sm mt-1">{rupee(item.price)}</p></div><div className="flex items-center bg-muted rounded-full px-1 h-9"><button aria-label={`Decrease ${item.name}`} data-testid={`cart-${item.id}-decrease-button`} onClick={() => updateQty(item.id, null, -1)} className="w-7 h-7 grid place-items-center"><Minus className="w-4 h-4" /></button><span data-testid={`cart-${item.id}-quantity`} className="text-sm font-bold w-5 text-center">{item.qty}</span><button aria-label={`Increase ${item.name}`} data-testid={`cart-${item.id}-increase-button`} onClick={() => updateQty(item.id, null, 1)} className="w-7 h-7 grid place-items-center"><Plus className="w-4 h-4" /></button></div><button aria-label={`Remove ${item.name}`} data-testid={`cart-${item.id}-remove-button`} onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button></motion.div>)}
          <div className="rounded-2xl border border-eco/30 bg-eco/5 p-4 flex items-center gap-3"><span className="w-10 h-10 rounded-xl bg-eco/15 text-eco grid place-items-center"><Leaf className="w-5 h-5" /></span><div className="flex-1"><p className="font-heading font-bold text-sm">Eco packaging</p><p className="text-xs text-muted-foreground">{eco ? "Reduced packaging is sent with this order and reflected in the server quote." : "Standard packaging preferences apply."}</p></div><Switch checked={eco} onCheckedChange={setEco} data-testid="cart-eco-toggle" /></div>
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground"><p className="font-bold text-foreground">Impact updates after verified payment</p><p className="mt-1">Eco Score and packaging avoided change only after the payment provider confirms an Eco order—not when this toggle moves.</p></div>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-20 h-fit">
          <h3 className="font-heading font-bold mb-4">Server-verified totals</h3>
          {quoteError && <div role="alert" data-testid="cart-quote-error-alert" className="rounded-xl bg-destructive/5 text-destructive text-sm p-3 mb-4">{quoteError}</div>}
          {!quote ? <div data-testid="cart-quote-loading" className="py-6 grid place-items-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : <><div className="flex justify-between text-sm py-1 text-muted-foreground"><span>Item total</span><span>{rupee(quote.subtotal)}</span></div><div className="flex justify-between text-sm py-1 text-muted-foreground"><span>Delivery fee</span><span>{rupee(quote.delivery)}</span></div><div className="flex justify-between text-sm py-1 text-muted-foreground"><span>Estimated taxes</span><span>{rupee(quote.taxes)}</span></div>{quote.eco_discount > 0 && <div data-testid="cart-eco-discount" className="flex justify-between text-sm py-1 text-eco"><span>Eco packaging credit</span><span>−{rupee(quote.eco_discount)}</span></div>}<div data-testid="cart-total" className="flex justify-between font-heading font-black text-lg pt-3 mt-2 border-t border-border"><span>Total</span><span>{rupee(quote.total)}</span></div></>}
          <Button data-testid="proceed-checkout-btn" disabled={!quote} onClick={() => navigate("/checkout")} className="w-full rounded-full h-12 mt-4 gap-2">Continue to checkout <ArrowRight className="w-4 h-4" /></Button>
          <p className="text-[10px] text-center text-muted-foreground mt-3">Payment is available only through a configured, verified provider.</p>
        </aside>
      </div>
    </PageWrap>
  );
}
