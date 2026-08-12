import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Users, Copy, Check, QrCode, Plus, UserPlus, ArrowRight, Wallet, X, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PageWrap } from "@/components/Layout";
import { SectionHead, VegDot } from "@/components/Cards";
import { useApp } from "@/context/AppContext";
import { FRIENDS, FOODS, rupee } from "@/data/mockData";

function QrArt({ value }) {
  const cells = Array.from({ length: 144 }, (_, i) => ((i * 7 + value.length * 3 + (i % 5)) % 3 === 0));
  return (
    <div className="w-40 h-40 rounded-2xl bg-white p-3 grid grid-cols-12 gap-0.5">
      {cells.map((on, i) => <div key={i} className={`rounded-[1px] ${on ? "bg-foreground" : "bg-transparent"}`} />)}
    </div>
  );
}

export default function GroupOrders() {
  const nav = useNavigate();
  const { group, startGroup, joinMember, cart, addToCart, foodSubtotal } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeMember, setActiveMember] = useState("u1");
  const [pickOpen, setPickOpen] = useState(false);

  if (!group) {
    return (
      <PageWrap>
        <div className="max-w-xl mx-auto text-center pt-10">
          <span className="w-16 h-16 rounded-3xl bg-primary/10 text-primary grid place-items-center mx-auto mb-5"><Users className="w-8 h-8" /></span>
          <h1 className="text-3xl font-heading font-black tracking-tight">Group Orders</h1>
          <p className="text-muted-foreground mt-3">Everyone adds their own food to one shared cart. The host pays once, and MoodBite tracks who owes what — no more awkward money chases.</p>
          <Button data-testid="start-group-btn" onClick={() => startGroup()} className="mt-6 rounded-full h-12 px-7 gap-2">Start a Group Order <ArrowRight className="w-4 h-4" /></Button>
        </div>
      </PageWrap>
    );
  }

  const shareLink = `moodbite.app/join/${group.code}`;
  const copy = () => { navigator.clipboard?.writeText(shareLink); setCopied(true); toast.success("Link copied!"); setTimeout(() => setCopied(false), 1500); };
  const notJoined = FRIENDS.filter((f) => !group.members.find((m) => m.id === f.id));

  const byMember = (id) => cart.filter((i) => i.member === id);
  const memberTotal = (id) => byMember(id).reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = foodSubtotal > 0 ? 29 : 0;
  const taxes = Math.round(foodSubtotal * 0.05);
  const total = foodSubtotal + delivery + taxes;

  return (
    <PageWrap>
      <SectionHead title="Group Order" subtitle="One shared cart · Host pays once · Everyone settles up" />

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div>
          {/* Invite */}
          <div className="rounded-3xl border border-border bg-card p-6 mb-6">
            <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" /> Invite your friends</h3>
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="flex flex-col items-center gap-2">
                <QrArt value={group.code} />
                <span className="text-xs text-muted-foreground">Scan to join</span>
              </div>
              <div className="flex-1 w-full">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Group code</label>
                <div className="text-3xl font-heading font-black tracking-widest text-primary mt-1" data-testid="group-code">{group.code}</div>
                <div className="flex items-center gap-2 mt-3 bg-muted rounded-full px-4 py-2">
                  <span className="text-sm flex-1 truncate">{shareLink}</span>
                  <button data-testid="copy-link-btn" onClick={copy} className="text-primary font-semibold text-sm flex items-center gap-1">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? "Copied" : "Copy"}
                  </button>
                </div>
                {notJoined.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">Simulate friends joining:</p>
                    <div className="flex flex-wrap gap-2">
                      {notJoined.map((f) => (
                        <button key={f.id} data-testid={`join-${f.id}`} onClick={() => joinMember(f)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:border-primary text-sm font-semibold transition-colors">
                          <span className={`w-6 h-6 rounded-full ${f.color} text-white grid place-items-center text-xs`}>{f.avatar}</span>{f.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Member tabs + add */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-lg">Shared cart</h3>
            <Dialog open={pickOpen} onOpenChange={setPickOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="add-items-btn" className="rounded-full gap-1"><Plus className="w-4 h-4" /> Add items</Button>
              </DialogTrigger>
              <DialogContent data-testid="group-add-items-dialog" closeTestId="group-add-items-close-button" className="rounded-3xl max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add items to the group cart</DialogTitle>
                  <DialogDescription>Choose a group member, then add dishes to their shared-cart section.</DialogDescription>
                </DialogHeader>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Adding for:</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {group.members.map((m) => (
                      <button key={m.id} data-testid={`member-tab-${m.id}`} onClick={() => setActiveMember(m.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${activeMember === m.id ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
                        <span className={`w-5 h-5 rounded-full ${m.color} text-white grid place-items-center text-[10px]`}>{m.avatar}</span>{m.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                  <div className="max-h-72 overflow-y-auto no-scrollbar space-y-2">
                    {FOODS.slice(0, 12).map((f) => (
                      <div key={f.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted">
                        <img src={f.img} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{f.name}</p><p className="text-xs text-muted-foreground">{rupee(f.price)}</p></div>
                        <Button size="sm" variant="outline" data-testid={`group-add-${f.id}`} onClick={() => addToCart(f, activeMember)} className="rounded-full h-8"><Plus className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {group.members.map((m) => {
              const items = byMember(m.id);
              return (
                <motion.div key={m.id} layout className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full ${m.color} text-white grid place-items-center text-sm font-bold`}>{m.avatar}</span>
                      <span className="font-heading font-bold">{m.name}</span>
                    </div>
                    <span data-testid={`group-member-${m.id}-total`} className="font-bold">{rupee(memberTotal(m.id))}</span>
                  </div>
                  {items.length === 0 ? <p className="text-sm text-muted-foreground pl-10">No items yet</p> : (
                    <div className="pl-10 space-y-1">
                      {items.map((i) => (
                        <div key={i.id} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2"><VegDot veg={i.veg} /> {i.name} × {i.qty}</span>
                          <span className="text-muted-foreground">{rupee(i.price * i.qty)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bill + settlement */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-5 lg:sticky lg:top-20">
            <h3 className="font-heading font-bold mb-4">Bill summary</h3>
            {[["Food subtotal", foodSubtotal], ["Delivery fee", delivery], ["Taxes & service (5%)", taxes]].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm py-1 text-muted-foreground"><span>{l}</span><span>{rupee(v)}</span></div>
            ))}
            <div className="flex justify-between text-sm py-1 text-eco"><span>Group discount</span><span>- {rupee(0)}</span></div>
            <div data-testid="group-order-total" className="flex justify-between font-heading font-black text-lg pt-3 mt-2 border-t border-border"><span>Total</span><span>{rupee(total)}</span></div>

            <div className="mt-4 rounded-2xl bg-primary/5 border border-primary/20 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Host pays once</p>
              <p className="text-2xl font-heading font-black">{rupee(total)}</p>
              <p className="text-xs text-muted-foreground mt-1">You place & pay the full order. Friends settle their share with you.</p>
            </div>
            <Button data-testid="group-checkout-btn" disabled={total === 0} onClick={() => nav("/cart")} className="w-full rounded-full h-12 mt-4 gap-2">
              Review & Checkout <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <Settlement group={group} memberTotal={memberTotal} />
        </aside>
      </div>
    </PageWrap>
  );
}

function Settlement({ group, memberTotal }) {
  const { setSettlement } = useApp();
  const [qrOpen, setQrOpen] = useState(false);
  const others = group.members.filter((m) => m.id !== "u1" && memberTotal(m.id) > 0);
  if (others.length === 0) return null;
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold flex items-center gap-2"><Wallet className="w-5 h-5 text-eco" /> Settlement</h3>
        <Dialog open={qrOpen} onOpenChange={setQrOpen}>
          <DialogTrigger asChild><Button data-testid="settlement-payment-qr-button" size="sm" variant="outline" className="rounded-full gap-1 text-xs"><QrCode className="w-3.5 h-3.5" /> Payment QR</Button></DialogTrigger>
          <DialogContent data-testid="settlement-payment-qr-dialog" closeTestId="settlement-payment-qr-close-button" className="rounded-3xl max-w-xs text-center">
            <DialogHeader>
              <DialogTitle>Share Payment QR</DialogTitle>
              <DialogDescription>Demo UPI details for settling a group-order share with the host.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3 py-2">
              <QrArt value={"host-" + group.code} />
              <p className="text-sm font-semibold">host@moodbite (Demo UPI)</p>
              <p className="text-xs text-muted-foreground">Demo Mode — friends can scan to send their share. No real payment is processed.</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {others.map((m) => {
          const status = group.settlements[m.id] || "owed";
          return (
            <div key={m.id} className="rounded-2xl border border-border p-3" data-testid={`settle-${m.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full ${m.color} text-white grid place-items-center text-xs font-bold`}>{m.avatar}</span>
                  <span className="font-semibold text-sm">{m.name}</span>
                </div>
                <span className="font-bold text-sm flex items-center"><IndianRupee className="w-3.5 h-3.5" />{memberTotal(m.id)}</span>
              </div>
              <div className="mt-2.5">
                {status === "owed" && (
                  <Button size="sm" variant="outline" data-testid={`sent-${m.id}`} onClick={() => setSettlement(m.id, "sent")} className="w-full rounded-full h-8 text-xs">I've sent my share</Button>
                )}
                {status === "sent" && (
                  <div>
                    <p data-testid={`settlement-${m.id}-pending-status`} className="text-xs text-amber-600 font-semibold mb-2 text-center">{m.name} marked payment as complete</p>
                    <div className="flex gap-2">
                      <Button size="sm" data-testid={`received-${m.id}`} onClick={() => setSettlement(m.id, "received")} className="flex-1 rounded-full h-8 text-xs bg-eco hover:bg-eco/90">Received</Button>
                      <Button size="sm" variant="outline" data-testid={`notreceived-${m.id}`} onClick={() => setSettlement(m.id, "owed")} className="flex-1 rounded-full h-8 text-xs">Not received</Button>
                    </div>
                  </div>
                )}
                {status === "received" && <p data-testid={`settlement-${m.id}-status`} className="text-xs text-eco font-bold text-center flex items-center justify-center gap-1"><Check className="w-3.5 h-3.5" /> Settled</p>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">Prototype only — MoodBite does not verify bank transactions.</p>
    </div>
  );
}
