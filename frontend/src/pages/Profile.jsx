import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, CheckCircle2, ClipboardList, Heart, Leaf, LockKeyhole, LogOut, Mail, Store, Users, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrap } from "@/components/Layout";
import { FallbackImage } from "@/components/FallbackImage";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useCatalog } from "@/context/CatalogContext";
import { api } from "@/lib/api";
import { rupee } from "@/data/mockData";


function ProfileCard({ title, icon: Icon, children, action }) {
  return <section className="rounded-2xl border border-border bg-card p-6"><div className="flex items-center justify-between gap-3 mb-4"><h2 className="font-heading font-bold flex items-center gap-2"><Icon className="w-4 h-4 text-primary" />{title}</h2>{action}</div>{children}</section>;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { orders, subscriptions, cancelSubscription, saved, ecoStats, group } = useApp();
  const { restaurants, tiffin } = useCatalog();
  const [payments, setPayments] = useState(null);
  const savedRestaurants = restaurants.filter((item) => saved.restaurants.includes(item.id));
  const savedTiffin = tiffin.filter((item) => saved.tiffin.includes(item.id));

  useEffect(() => { api.get("/payments/availability").then(({ data }) => setPayments(data)).catch(() => {}); }, []);
  const signOut = async () => { await logout(); navigate("/login", { replace: true }); };

  return (
    <PageWrap>
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center gap-6">
        {user.picture ? <img src={user.picture} alt="" className="w-24 h-24 rounded-2xl object-cover" /> : <span className="w-24 h-24 rounded-2xl bg-primary text-primary-foreground grid place-items-center font-heading font-black text-4xl">{user.name[0].toUpperCase()}</span>}
        <div className="text-center sm:text-left flex-1"><h1 data-testid="profile-user-name" className="text-3xl font-heading font-black">{user.name}</h1><p data-testid="profile-user-email" className="text-muted-foreground mt-1 flex items-center justify-center sm:justify-start gap-2"><Mail className="w-4 h-4" />{user.email}</p><div className="flex justify-center sm:justify-start gap-2 mt-3">{user.providers.map((provider) => <span key={provider} className="rounded-full bg-muted px-3 py-1 text-xs font-bold capitalize">{provider}</span>)}</div></div>
        <div className="flex gap-6 text-center"><div><p className="text-2xl font-heading font-black text-eco">{ecoStats.score}</p><p className="text-xs text-muted-foreground">Eco Score</p></div><div><p className="text-2xl font-heading font-black text-primary">{orders.length}</p><p className="text-xs text-muted-foreground">Orders</p></div></div>
        <Button data-testid="profile-logout-button" variant="outline" onClick={signOut} className="rounded-full gap-2"><LogOut className="w-4 h-4" /> Sign out</Button>
      </section>

      <div className="grid md:grid-cols-2 gap-5">
        <ProfileCard title="Account security" icon={LockKeyhole}><div className="flex items-start gap-3 rounded-xl bg-eco/5 border border-eco/20 p-4"><CheckCircle2 className="w-5 h-5 text-eco shrink-0" /><div><p className="font-bold text-sm">Persistent secure session</p><p className="text-xs text-muted-foreground mt-1">Passwords use Argon2. Sessions are revocable and protected by HttpOnly cookies and CSRF tokens.</p></div></div></ProfileCard>

        <ProfileCard title="Payment availability" icon={WalletCards}><div data-testid="profile-payment-status" className="space-y-2 text-sm"><div className="flex justify-between"><span>Stripe</span><span className={payments?.stripe?.available ? "text-eco font-bold" : "text-amber-700 font-bold"}>{payments?.stripe?.available ? "Available" : "Unavailable"}</span></div><div className="flex justify-between"><span>Razorpay</span><span className={payments?.razorpay?.available ? "text-eco font-bold" : "text-amber-700 font-bold"}>{payments?.razorpay?.available ? "Available" : "Not configured"}</span></div><p className="text-xs text-muted-foreground pt-2 border-t">MoodBite never marks an order paid without provider verification.</p></div></ProfileCard>

        <ProfileCard title="Tiffin plan requests" icon={CalendarCheck} action={<Button data-testid="profile-browse-tiffin-button" size="sm" variant="ghost" onClick={() => navigate("/tiffin")} className="rounded-full text-eco">Browse</Button>}>{subscriptions.length === 0 ? <p className="text-sm text-muted-foreground">No plan requests yet.</p> : <div className="space-y-2">{subscriptions.map((subscription) => <div key={subscription.subscription_id} data-testid={`profile-subscription-${subscription.subscription_id}`} className="rounded-xl bg-muted/50 p-3 flex items-center justify-between gap-3"><div><p className="font-semibold text-sm">{subscription.provider}</p><p className="text-xs text-muted-foreground">{subscription.plan} · {subscription.status.replaceAll("_", " ")}</p></div><div className="text-right"><p className="font-bold text-sm">{rupee(subscription.price)}</p>{subscription.status === "payment_required" && <button data-testid={`profile-subscription-${subscription.subscription_id}-cancel-button`} onClick={() => cancelSubscription(subscription.subscription_id)} className="text-xs font-bold text-destructive hover:underline mt-1">Cancel</button>}</div></div>)}</div>}</ProfileCard>

        <ProfileCard title="Active group" icon={Users} action={<Button data-testid="profile-open-group-button" size="sm" variant="ghost" onClick={() => navigate("/group")} className="rounded-full text-primary">Open</Button>}>{group ? <div className="rounded-xl bg-muted/50 p-3"><p className="font-semibold text-sm">{group.name} · {group.code}</p><p className="text-xs text-muted-foreground">{group.members.length} participant{group.members.length === 1 ? "" : "s"} · {group.status}</p></div> : <p className="text-sm text-muted-foreground">No active group order.</p>}</ProfileCard>

        <ProfileCard title="Eco impact" icon={Leaf} action={<Button data-testid="profile-eco-details-button" size="sm" variant="ghost" onClick={() => navigate("/eco")} className="rounded-full text-eco">Details</Button>}><div className="grid grid-cols-3 gap-3 text-center"><div><p className="text-xl font-black text-eco">{ecoStats.packaging}</p><p className="text-[10px] text-muted-foreground">Packaging</p></div><div><p className="text-xl font-black text-primary">{ecoStats.score}</p><p className="text-[10px] text-muted-foreground">Score</p></div><div><p className="text-xl font-black text-sky-600">{ecoStats.ecoOrders}</p><p className="text-[10px] text-muted-foreground">Orders</p></div></div></ProfileCard>

        <ProfileCard title="Saved restaurants" icon={Store} action={<Button data-testid="profile-explore-restaurants-button" size="sm" variant="ghost" onClick={() => navigate("/explore")} className="rounded-full">Explore</Button>}>{savedRestaurants.length ? <div className="space-y-2">{savedRestaurants.map((restaurant) => <button key={restaurant.id} data-testid={`profile-saved-restaurant-${restaurant.id}-button`} onClick={() => navigate(`/restaurant/${restaurant.id}`)} className="w-full flex items-center gap-3 rounded-xl hover:bg-muted p-2 text-left"><FallbackImage src={restaurant.img} alt={restaurant.name} className="w-10 h-10 rounded-lg object-cover" /><span className="text-sm font-semibold">{restaurant.name}</span></button>)}</div> : <p className="text-sm text-muted-foreground">No saved restaurants yet.</p>}</ProfileCard>

        <ProfileCard title="Saved Tiffin providers" icon={Heart} action={<Button data-testid="profile-browse-saved-tiffin-button" size="sm" variant="ghost" onClick={() => navigate("/tiffin")} className="rounded-full text-eco">Browse</Button>}>{savedTiffin.length ? <div className="space-y-2">{savedTiffin.map((provider) => <button key={provider.id} data-testid={`profile-saved-tiffin-${provider.id}-button`} onClick={() => navigate(`/tiffin/${provider.id}`)} className="w-full flex items-center gap-3 rounded-xl hover:bg-muted p-2 text-left"><FallbackImage src={provider.img} alt={provider.name} className="w-10 h-10 rounded-lg object-cover" /><span className="text-sm font-semibold">{provider.name}</span></button>)}</div> : <p className="text-sm text-muted-foreground">No saved providers yet.</p>}</ProfileCard>

        <ProfileCard title="Recent orders" icon={ClipboardList} action={<Button data-testid="profile-view-orders-button" size="sm" variant="ghost" onClick={() => navigate("/orders")} className="rounded-full">View all</Button>}>{orders.length ? <div className="space-y-2">{orders.slice(0, 3).map((order) => <div key={order.order_id || order.id} className="rounded-xl bg-muted/50 p-3 flex justify-between"><div><p className="font-semibold text-sm">{order.restaurant || "MoodBite order"}</p><p className="text-xs text-muted-foreground">{String(order.status).replaceAll("_", " ")}</p></div><span className="font-bold text-sm">{rupee(order.amount ?? order.total)}</span></div>)}</div> : <p className="text-sm text-muted-foreground">No order history yet.</p>}</ProfileCard>
      </div>
    </PageWrap>
  );
}
