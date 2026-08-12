import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Leaf, Heart, ClipboardList, CalendarCheck, Users, Store, Utensils, Salad, Wallet, MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrap } from "@/components/Layout";
import { SectionHead } from "@/components/Cards";
import { useApp } from "@/context/AppContext";
import { RESTAURANTS, TIFFIN, SAMPLE_ORDERS, rupee } from "@/data/mockData";

const PROFILE = { name: "Aarav Sharma", email: "aarav.s@campus.edu", phone: "+91 98765 43210", location: "Sunrise Hostel, Bengaluru", college: "IIIT Bengaluru · 2nd Year" };
const FOOD_PREFS = ["North Indian", "Chinese", "Cafe", "Biryani"];
const DIET_PREFS = ["Vegetarian", "No beef", "Low spice", "High protein"];

function Card({ title, icon: Icon, children, action }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold flex items-center gap-2"><Icon className="w-4.5 h-4.5 text-primary" /> {title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
function Chip({ children }) { return <span className="px-3 py-1 rounded-full bg-muted text-xs font-semibold text-muted-foreground">{children}</span>; }

export default function Profile() {
  const nav = useNavigate();
  const { orders, subs, saved, ecoStats, group } = useApp();
  const savedR = RESTAURANTS.filter((r) => saved.restaurants.includes(r.id));
  const savedT = TIFFIN.filter((t) => saved.tiffin.includes(t.id));
  const settlements = [
    { name: "Ananya", amount: 180, status: "Received", date: "12 Jun" },
    { name: "Priya", amount: 120, status: "Pending", date: "12 Jun" },
  ];

  return (
    <PageWrap>
      {/* Header */}
      <div className="rounded-[2rem] border border-border bg-gradient-to-br from-primary/10 via-card to-eco/10 p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center gap-6">
        <span className="w-24 h-24 rounded-3xl bg-primary text-primary-foreground grid place-items-center font-heading font-black text-4xl shrink-0">A</span>
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-3xl font-heading font-black tracking-tight">{PROFILE.name}</h1>
          <p className="text-muted-foreground">{PROFILE.college}</p>
          <div className="flex flex-wrap gap-4 mt-3 justify-center sm:justify-start text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{PROFILE.email}</span>
            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{PROFILE.phone}</span>
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{PROFILE.location}</span>
          </div>
        </div>
        <div className="flex gap-6 text-center">
          <div><p className="text-2xl font-heading font-black text-eco">{ecoStats.score}</p><p className="text-xs text-muted-foreground">Eco Score</p></div>
          <div><p className="text-2xl font-heading font-black text-primary">{orders.length + SAMPLE_ORDERS.length}</p><p className="text-xs text-muted-foreground">Orders</p></div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card title="Food Preferences" icon={Utensils}>
          <div className="flex flex-wrap gap-2">{FOOD_PREFS.map((p) => <Chip key={p}>{p}</Chip>)}</div>
        </Card>
        <Card title="Dietary Preferences" icon={Salad}>
          <div className="flex flex-wrap gap-2">{DIET_PREFS.map((p) => <Chip key={p}>{p}</Chip>)}</div>
        </Card>

        <Card title="Active Tiffin Subscriptions" icon={CalendarCheck} action={<Button data-testid="profile-browse-tiffin-button" size="sm" variant="ghost" className="rounded-full text-eco" onClick={() => nav("/tiffin")}>Browse</Button>}>
          {subs.length === 0 ? <p className="text-sm text-muted-foreground">No active subscriptions. Explore Daily Tiffin to subscribe.</p> : (
            <div className="space-y-2">{subs.map((s) => (
              <div key={s.id} data-testid={`profile-subscription-${s.id}`} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                <div><p className="font-semibold text-sm">{s.provider}</p><p className="text-xs text-muted-foreground">{s.plan} · from {s.startDate}</p></div>
                <span className="font-bold text-sm text-eco">{rupee(s.price)}</span>
              </div>
            ))}</div>
          )}
        </Card>

        <Card title="Group Orders" icon={Users} action={<Button data-testid="profile-open-group-button" size="sm" variant="ghost" className="rounded-full text-primary" onClick={() => nav("/group")}>Open</Button>}>
          {group ? (
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="font-semibold text-sm">Active group · {group.code}</p>
              <p className="text-xs text-muted-foreground">{group.members.length} members</p>
            </div>
          ) : <p className="text-sm text-muted-foreground">No active group order right now.</p>}
        </Card>

        <Card title="Payment / Settlement History" icon={Wallet}>
          <div className="space-y-2">{settlements.map((s, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
              <div><p className="font-semibold text-sm">{s.name}</p><p className="text-xs text-muted-foreground">{s.date} · group settle</p></div>
              <div className="text-right"><p className="font-bold text-sm">{rupee(s.amount)}</p><p className={`text-xs font-semibold ${s.status === "Received" ? "text-eco" : "text-amber-600"}`}>{s.status}</p></div>
            </div>
          ))}</div>
        </Card>

        <Card title="Eco Impact" icon={Leaf} action={<Button data-testid="profile-eco-details-button" size="sm" variant="ghost" className="rounded-full text-eco" onClick={() => nav("/eco")}>Details</Button>}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><p className="text-xl font-heading font-black text-eco">{ecoStats.packaging}</p><p className="text-[10px] text-muted-foreground">Packaging saved</p></div>
            <div><p className="text-xl font-heading font-black text-primary">{ecoStats.score}</p><p className="text-[10px] text-muted-foreground">Eco Score</p></div>
            <div><p className="text-xl font-heading font-black text-sky-500">{ecoStats.ecoOrders}</p><p className="text-[10px] text-muted-foreground">Eco orders</p></div>
          </div>
        </Card>

        <Card title="Saved Restaurants" icon={Store} action={<Button data-testid="profile-explore-restaurants-button" size="sm" variant="ghost" className="rounded-full" onClick={() => nav("/explore")}>Explore</Button>}>
          {savedR.length === 0 ? <p className="text-sm text-muted-foreground">Tap the heart on any restaurant to save it.</p> : (
            <div className="space-y-2">{savedR.map((r) => (
              <button key={r.id} data-testid={`profile-saved-restaurant-${r.id}-button`} onClick={() => nav(`/restaurant/${r.id}`)} className="w-full flex items-center gap-3 rounded-xl hover:bg-muted p-2 text-left">
                <img src={r.img} alt="" className="w-10 h-10 rounded-lg object-cover" /><span className="text-sm font-semibold">{r.name}</span>
              </button>
            ))}</div>
          )}
        </Card>

        <Card title="Saved Tiffin Providers" icon={Heart} action={<Button data-testid="profile-browse-saved-tiffin-button" size="sm" variant="ghost" className="rounded-full text-eco" onClick={() => nav("/tiffin")}>Browse</Button>}>
          {savedT.length === 0 ? <p className="text-sm text-muted-foreground">Save your favourite tiffin providers here.</p> : (
            <div className="space-y-2">{savedT.map((t) => (
              <button key={t.id} data-testid={`profile-saved-tiffin-${t.id}-button`} onClick={() => nav(`/tiffin/${t.id}`)} className="w-full flex items-center gap-3 rounded-xl hover:bg-muted p-2 text-left">
                <img src={t.img} alt="" className="w-10 h-10 rounded-lg object-cover" /><span className="text-sm font-semibold">{t.name}</span>
              </button>
            ))}</div>
          )}
        </Card>

        <Card title="Order History" icon={ClipboardList} action={<Button data-testid="profile-view-orders-button" size="sm" variant="ghost" className="rounded-full" onClick={() => nav("/orders")}>View all</Button>}>
          <div className="space-y-2">{SAMPLE_ORDERS.slice(0, 3).map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
              <div><p className="font-semibold text-sm">{o.restaurant}</p><p className="text-xs text-muted-foreground">{o.date}</p></div>
              <span className="font-bold text-sm">{rupee(o.total)}</span>
            </div>
          ))}</div>
        </Card>

        <Card title="Donations" icon={Heart}>
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
            <p className="text-2xl font-heading font-black text-primary">₹85</p>
            <p className="text-xs text-muted-foreground mt-1">Contributed to causes (demo)</p>
          </div>
        </Card>
      </div>
    </PageWrap>
  );
}
