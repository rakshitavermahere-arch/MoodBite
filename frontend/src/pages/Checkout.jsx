import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, ArrowRight, MapPin, Leaf, Heart, Smartphone, CreditCard, Wallet, Building2, Banknote, Loader2, PartyPopper, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PageWrap } from "@/components/Layout";
import { useApp } from "@/context/AppContext";
import { rupee } from "@/data/mockData";

const STEPS = ["Review", "Address", "Payment", "Done"];
const PAY_METHODS = [
  { id: "upi", label: "UPI", icon: Smartphone, sub: "GPay, PhonePe, Paytm" },
  { id: "card", label: "Card", icon: CreditCard, sub: "Credit / Debit" },
  { id: "wallet", label: "Wallet", icon: Wallet, sub: "Paytm, Amazon Pay" },
  { id: "netbanking", label: "Net Banking", icon: Building2, sub: "All major banks" },
  { id: "cod", label: "Cash on Delivery", icon: Banknote, sub: "Pay when it arrives" },
];

function DemoBadge() {
  return <div data-testid="checkout-demo-mode-alert" className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 rounded-full px-3 py-1.5 w-fit"><ShieldCheck className="w-3.5 h-3.5" /> Demo Mode — No real payment is processed</div>;
}

export default function Checkout() {
  const nav = useNavigate();
  const { cart, foodSubtotal, eco, setEco, donation, placeOrder } = useApp();
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [addr, setAddr] = useState({ name: "Aarav Sharma", phone: "98765 43210", line: "Room 214, Sunrise Hostel, MG Road", city: "Bengaluru 560001" });
  const [pref, setPref] = useState("Leave at door");

  if (cart.length === 0 && step < 3) { nav("/cart"); return null; }

  const delivery = 29, taxes = Math.round(foodSubtotal * 0.05), ecoDiscount = eco ? 10 : 0;
  const total = foodSubtotal + delivery + taxes + donation - ecoDiscount;

  const pay = () => {
    setProcessing(true);
    setTimeout(() => {
      const order = placeOrder({
        items: cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        restaurant: cart[0]?.restaurant, total, method, address: `${addr.line}, ${addr.city}`,
        eco, status: "Order Confirmed",
      });
      setProcessing(false);
      setStep(3);
      window._lastOrder = order;
    }, 2600);
  };

  return (
    <PageWrap>
      <button data-testid="checkout-back-button" onClick={() => (step === 0 ? nav("/cart") : setStep((s) => s - 1))} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back</button>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8 max-w-lg">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full grid place-items-center text-sm font-bold shrink-0 ${i < step ? "bg-eco text-eco-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs font-semibold hidden sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded ${i < step ? "bg-eco" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
        <div className="min-h-[40vh]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-heading font-extrabold mb-4">Review your order</h2>
                <div className="rounded-2xl border border-border bg-card divide-y divide-border">
                  {cart.map((i) => (
                    <div key={i.id + i.member} className="flex items-center justify-between p-4">
                      <span className="text-sm font-semibold">{i.name} × {i.qty}</span>
                      <span className="text-sm">{rupee(i.price * i.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-eco/30 bg-eco/5 p-4 flex items-center gap-3 mt-4">
                  <Leaf className="w-5 h-5 text-eco" />
                  <div className="flex-1"><p className="font-heading font-bold text-sm">Eco Mode</p><p className="text-xs text-muted-foreground">Reduced-packaging delivery · Eco Score +12</p></div>
                  <Switch checked={eco} onCheckedChange={setEco} data-testid="checkout-eco-toggle" />
                </div>
                <Button data-testid="checkout-next-0" onClick={() => setStep(1)} className="rounded-full h-12 px-6 gap-2 mt-6">Continue <ArrowRight className="w-4 h-4" /></Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="addr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-heading font-extrabold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Delivery address</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} placeholder="Full name" className="rounded-xl" data-testid="addr-name" />
                  <Input value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} placeholder="Phone" className="rounded-xl" data-testid="addr-phone" />
                  <Input value={addr.line} onChange={(e) => setAddr({ ...addr, line: e.target.value })} placeholder="Address" className="rounded-xl sm:col-span-2" data-testid="addr-line" />
                  <Input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} placeholder="City & PIN" className="rounded-xl sm:col-span-2" data-testid="addr-city" />
                </div>
                <h3 className="font-heading font-bold mt-6 mb-2 text-sm">Delivery preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {["Leave at door", "Hand to me", "Avoid calling", "Ring the bell"].map((p) => (
                    <button key={p} onClick={() => setPref(p)} data-testid={`preference-${p.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-button`}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${pref === p ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary"}`}>{p}</button>
                  ))}
                </div>
                <Button data-testid="checkout-next-1" onClick={() => setStep(2)} className="rounded-full h-12 px-6 gap-2 mt-6">Continue to Payment <ArrowRight className="w-4 h-4" /></Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h2 className="text-xl font-heading font-extrabold">Payment method</h2>
                  <DemoBadge />
                </div>
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {PAY_METHODS.map((m) => (
                    <button key={m.id} data-testid={`pay-method-${m.id}`} onClick={() => setMethod(m.id)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-colors ${method === m.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50"}`}>
                      <span className={`w-10 h-10 rounded-xl grid place-items-center ${method === m.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><m.icon className="w-5 h-5" /></span>
                      <div><p className="font-heading font-bold text-sm">{m.label}</p><p className="text-xs text-muted-foreground">{m.sub}</p></div>
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <PaymentForm method={method} total={total} />
                </div>

                <Button data-testid="pay-now-btn" onClick={pay} disabled={processing} className="rounded-full h-12 w-full mt-6 gap-2 text-base">
                  {method === "cod" ? "Confirm COD Order" : `Pay ${rupee(total)}`}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-3">We never store card, CVV, UPI PIN or banking credentials. This is a visual demo only.</p>
              </motion.div>
            )}

            {step === 3 && <SuccessView nav={nav} total={total} method={method} />}
          </AnimatePresence>
        </div>

        {step < 3 && (
          <aside className="rounded-3xl border border-border bg-card p-5 lg:sticky lg:top-20">
            <h3 className="font-heading font-bold mb-4">Summary</h3>
            {[["Item total", foodSubtotal], ["Delivery", delivery], ["Taxes", taxes]].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm py-1 text-muted-foreground"><span>{l}</span><span>{rupee(v)}</span></div>
            ))}
            {eco && <div className="flex justify-between text-sm py-1 text-eco"><span>Eco discount</span><span>- {rupee(ecoDiscount)}</span></div>}
            {donation > 0 && <div className="flex justify-between text-sm py-1 text-primary"><span>Donation</span><span>{rupee(donation)}</span></div>}
            <div data-testid="checkout-total" className="flex justify-between font-heading font-black text-lg pt-3 mt-2 border-t border-border"><span>Total</span><span>{rupee(total)}</span></div>
          </aside>
        )}
      </div>

      {/* Processing overlay */}
      <AnimatePresence>
        {processing && (
          <motion.div data-testid="checkout-processing-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/90 backdrop-blur grid place-items-center">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <Loader2 className="w-20 h-20 text-primary animate-spin" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-heading font-black">Processing payment…</h3>
              <p className="text-sm text-muted-foreground mt-1">Securing your order (demo)</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrap>
  );
}

function PaymentForm({ method, total }) {
  const [choices, setChoices] = useState({ wallet: "Paytm Wallet", netbanking: "HDFC Bank" });
  const choose = (type, value) => setChoices((current) => ({ ...current, [type]: value }));
  if (method === "upi") return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">UPI ID</label>
      <Input placeholder="yourname@upi" className="rounded-xl mt-1.5" data-testid="upi-id" />
      <div className="flex gap-2 mt-4">{["GPay", "PhonePe", "Paytm", "BHIM"].map((u) => <span key={u} className="px-3 py-2 rounded-xl bg-muted text-xs font-bold">{u}</span>)}</div>
      <div className="mt-4 flex items-center gap-4">
        <div className="w-24 h-24 rounded-xl bg-white border border-border grid grid-cols-8 gap-0.5 p-2">
          {Array.from({ length: 64 }, (_, i) => <div key={i} className={`rounded-[1px] ${(i * 3 + i % 4) % 3 === 0 ? "bg-foreground" : ""}`} />)}
        </div>
        <p className="text-xs text-muted-foreground">Scan the demo QR with any UPI app to simulate paying {rupee(total)}.</p>
      </div>
    </div>
  );
  if (method === "card") return (
    <div className="space-y-3">
      <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cardholder Name</label><Input placeholder="Name on card" className="rounded-xl mt-1.5" data-testid="card-name" /></div>
      <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Card Number</label><Input placeholder="4242 4242 4242 4242" className="rounded-xl mt-1.5" data-testid="card-number" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Expiry</label><Input placeholder="MM/YY" className="rounded-xl mt-1.5" data-testid="card-expiry" /></div>
        <div><label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CVV</label><Input placeholder="•••" className="rounded-xl mt-1.5" data-testid="card-cvv" /></div>
      </div>
    </div>
  );
  if (method === "wallet") return (
    <div className="grid grid-cols-2 gap-3">{["Paytm Wallet", "Amazon Pay", "PhonePe Wallet", "Mobikwik"].map((w, i) => <button key={w} data-testid={`wallet-option-${i}`} onClick={() => choose("wallet", w)} className={`p-3 rounded-xl border text-sm font-semibold transition-colors ${choices.wallet === w ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary"}`}>{w}</button>)}</div>
  );
  if (method === "netbanking") return (
    <div className="grid grid-cols-2 gap-3">{["HDFC Bank", "SBI", "ICICI Bank", "Axis Bank", "Kotak", "Yes Bank"].map((b, i) => <button key={b} data-testid={`bank-option-${i}`} onClick={() => choose("netbanking", b)} className={`p-3 rounded-xl border text-sm font-semibold transition-colors ${choices.netbanking === b ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary"}`}>{b}</button>)}</div>
  );
  return (
    <div className="text-center py-4">
      <Banknote className="w-10 h-10 text-eco mx-auto mb-3" />
      <p className="font-heading font-bold">Pay {rupee(total)} when your order arrives.</p>
      <p className="text-sm text-muted-foreground mt-1">Keep exact change handy for the delivery partner.</p>
    </div>
  );
}

function SuccessView({ nav, total, method }) {
  const order = window._lastOrder || { id: "MB0000", total };
  return (
    <motion.div data-testid="checkout-success-confirmation" key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md mx-auto pt-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 rounded-full bg-eco text-eco-foreground grid place-items-center mx-auto mb-5">
        <Check className="w-10 h-10" strokeWidth={3} />
      </motion.div>
      <h2 className="text-3xl font-heading font-black flex items-center justify-center gap-2">Payment Successful! <PartyPopper className="w-7 h-7 text-primary" /></h2>
      <p className="text-muted-foreground mt-2">Your food is on its way.</p>
      <div className="rounded-2xl border border-border bg-card p-5 mt-6 text-left space-y-2">
        {[["Order ID", order.id], ["Amount", rupee(order.total)], ["Payment", method.toUpperCase()], ["Estimated delivery", "35–40 min"]].map(([l, v]) => (
          <div key={l} className="flex justify-between text-sm"><span className="text-muted-foreground">{l}</span><span className="font-bold">{v}</span></div>
        ))}
      </div>
      <Button data-testid="continue-tracking-btn" onClick={() => nav(`/track/${order.id}`)} className="rounded-full h-12 w-full mt-6 gap-2">Continue to tracking <ArrowRight className="w-4 h-4" /></Button>
    </motion.div>
  );
}
