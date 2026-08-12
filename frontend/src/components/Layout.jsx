import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Compass, Sparkles, Users, UtensilsCrossed, Leaf, ClipboardList, User, ShoppingBag, LogOut } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/concierge", label: "AI Concierge", icon: Sparkles },
  { to: "/group", label: "Group Orders", icon: Users },
  { to: "/tiffin", label: "Daily Tiffin", icon: UtensilsCrossed },
  { to: "/eco", label: "Eco Impact", icon: Leaf },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/profile", label: "Profile", icon: User },
];
const MOBILE = [NAV[0], NAV[2], NAV[3], NAV[4], NAV[7]];

export function Navbar() {
  const { cartCount } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = async () => { await logout(); navigate("/login", { replace: true }); };
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <Link to="/" data-testid="brand-logo" className="flex items-center gap-2 shrink-0">
          <span className="w-9 h-9 rounded-xl bg-primary grid place-items-center text-primary-foreground font-heading font-black text-lg">M</span>
          <span className="font-heading font-black text-xl tracking-tight">MoodBite</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === "/"} data-testid={`nav-${n.label.toLowerCase().replace(/ /g, "-")}`}
              className={({ isActive }) => `px-3 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link aria-label="Open cart" to="/cart" data-testid="nav-cart" className="relative w-10 h-10 grid place-items-center rounded-full hover:bg-muted transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span data-testid="nav-cart-count" className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{cartCount}</span>
            )}
          </Link>
          {user ? <>
            <Link aria-label="Open profile" to="/profile" data-testid="nav-profile-button" className="w-10 h-10 grid place-items-center rounded-full bg-muted hover:bg-primary/10 font-bold transition-colors">
              {user.picture ? <img src={user.picture} alt="" className="w-full h-full rounded-full object-cover" /> : user.name?.[0]?.toUpperCase()}
            </Link>
            <button aria-label="Sign out" data-testid="nav-logout-button" onClick={signOut} className="w-10 h-10 grid place-items-center rounded-full text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"><LogOut className="w-4 h-4" /></button>
          </> : <Button asChild size="sm" className="rounded-full px-5"><Link to="/login" data-testid="nav-login-link">Sign in</Link></Button>}
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 backdrop-blur-xl bg-background/80 border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {MOBILE.map((n) => {
          const active = n.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to} data-testid={`bottomnav-${n.label.toLowerCase().replace(/ /g, "-")}`}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}>
              <n.icon className="w-5 h-5" />
              {n.label.split(" ")[0]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border mt-24 bg-muted/40">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-8 rounded-lg bg-primary grid place-items-center text-primary-foreground font-heading font-black">M</span>
            <span className="font-heading font-black text-lg">MoodBite</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">Food for your mood. Meals for your life. A student-first food platform.</p>
        </div>
        {[["Discover", ["Explore", "AI Concierge", "Daily Tiffin", "Eco Impact"]], ["Company", ["About", "Careers", "Blog", "Contact"]], ["Support", ["Help Center", "Safety", "Terms", "Privacy"]]].map(([h, items]) => (
          <div key={h}>
            <h4 className="font-heading font-bold mb-3 text-sm">{h}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">{items.map((i) => <li key={i}>{i}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="text-center text-xs text-muted-foreground pb-8">© 2026 MoodBite · Online checkout is enabled only after verified provider configuration.</div>
    </footer>
  );
}

export function PageWrap({ children }) {
  return (
    <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-28 lg:pb-16">
      {children}
    </motion.main>
  );
}

export function Layout() {
  return <><Navbar /><Outlet /><Footer /><BottomNav /></>;
}
