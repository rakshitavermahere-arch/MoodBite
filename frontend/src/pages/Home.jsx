import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { ArrowRight, Sparkles, Users, Leaf, Brain, CalendarCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrap } from "@/components/Layout";
import { RestaurantCard, FoodCard, TiffinCard, SectionHead, fadeUp } from "@/components/Cards";
import { MOODS, RESTAURANTS, FOODS, TIFFIN, IMG } from "@/data/mockData";

function MoodCard({ mood, i, onPick }) {
  const Icon = Icons[mood.icon] || Icons.Smile;
  return (
    <motion.button variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}
      whileHover={{ y: -6, scale: 1.03 }} whileTap={{ scale: 0.97 }}
      data-testid={`mood-card-${mood.id}`} onClick={() => onPick(mood)}
      className="relative overflow-hidden rounded-3xl aspect-[4/5] text-left group">
      <img src={mood.img} alt={mood.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      <div className={`absolute inset-0 bg-gradient-to-t ${mood.color} opacity-80 mix-blend-multiply`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="relative h-full p-4 flex flex-col justify-end text-white">
        <span className="w-10 h-10 rounded-2xl bg-white/25 backdrop-blur grid place-items-center mb-2"><Icon className="w-5 h-5" /></span>
        <span className="font-heading font-black text-lg leading-none">{mood.label}</span>
      </div>
    </motion.button>
  );
}

export default function Home() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const ask = () => nav(`/concierge${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  const pickMood = (m) => nav(`/concierge?q=${encodeURIComponent(m.query)}`);
  const budgetFoods = FOODS.filter((f) => f.price <= 150).slice(0, 4);

  return (
    <PageWrap>
      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card px-5 sm:px-10 py-12 sm:py-16 mb-14">
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-primary/20 blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-eco/20 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-5">
            <Sparkles className="w-3.5 h-3.5" /> AI-powered · Student-first
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black tracking-tighter leading-[1.05]">
            What does today <span className="text-primary">feel</span> like?
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-xl">
            Tell MoodBite what you're craving — or how you're feeling — and we'll help you find it.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-full px-4 py-1 focus-within:ring-2 ring-primary/40">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()}
                data-testid="hero-ai-input" placeholder="I'm feeling stressed, something comfy under ₹250…"
                className="flex-1 bg-transparent outline-none py-2.5 text-sm" />
            </div>
            <Button data-testid="hero-ask-btn" onClick={ask} className="rounded-full h-12 px-6 gap-2 text-base">
              Ask MoodBite <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Food for your mood. Meals for your life.</p>
        </div>
      </section>

      {/* MOODS */}
      <section className="mb-16">
        <SectionHead title="Pick a mood" subtitle="Tap how you feel and let the AI do the thinking." />
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {MOODS.map((m, i) => <MoodCard key={m.id} mood={m} i={i} onPick={pickMood} />)}
        </div>
      </section>

      {/* WHY MOODBITE bento */}
      <section className="mb-16">
        <SectionHead title="Why MoodBite?" subtitle="From 'What should I eat?' to 'What should I eat every day?'" />
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { id: "ai-concierge", icon: Brain, t: "Decide smarter", d: "AI helps you figure out what to eat.", to: "/concierge" },
            { id: "group-orders", icon: Users, t: "Order together", d: "Friends share one cart, no chaos.", to: "/group" },
            { id: "daily-tiffin", icon: CalendarCheck, t: "Eat every day", d: "Reliable tiffin & home-meal plans.", to: "/tiffin" },
            { id: "eco-impact", icon: Leaf, t: "Choose better", d: "Eco Mode makes impact visible.", to: "/eco" },
          ].map((x, i) => (
            <motion.button key={x.t} variants={fadeUp} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}
              onClick={() => nav(x.to)} data-testid={`why-${x.id}-card`}
              className="rounded-3xl border border-border bg-card p-6 text-left hover:-translate-y-1 hover:shadow-lg transition-transform transition-shadow">
              <span className="w-11 h-11 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-4"><x.icon className="w-5 h-5" /></span>
              <h3 className="font-heading font-bold text-lg">{x.t}</h3>
              <p className="text-sm text-muted-foreground mt-1">{x.d}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Popular near you */}
      <section className="mb-16">
        <SectionHead title="Popular near you" subtitle="Loved by students around campus"
          action={<Button data-testid="home-popular-see-all-button" variant="ghost" className="rounded-full gap-1" onClick={() => nav("/explore")}>See all <ArrowRight className="w-4 h-4" /></Button>} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {RESTAURANTS.slice(0, 4).map((r, i) => <RestaurantCard key={r.id} r={r} i={i} testIdScope="home-popular" />)}
        </div>
      </section>

      {/* Student-friendly */}
      <section className="mb-16">
        <SectionHead title="Student-friendly meals" subtitle="Delicious picks under ₹150" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {budgetFoods.map((f, i) => <FoodCard key={f.id} f={f} i={i} testIdScope="home-budget" />)}
        </div>
      </section>

      {/* Group order CTA */}
      <section className="mb-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-border">
          <img src={IMG.group} alt="Group order" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          <div className="relative p-8 sm:p-12 max-w-lg text-white">
            <h2 className="text-3xl sm:text-4xl font-heading font-black tracking-tight">Ordering with friends?</h2>
            <p className="mt-3 text-white/85">Everyone adds their own food to one shared cart. The host pays once, and MoodBite tracks who owes what.</p>
            <Button data-testid="home-group-cta" onClick={() => nav("/group")} className="mt-6 rounded-full h-12 px-6 gap-2 bg-white text-black hover:bg-white/90">
              Start a Group Order <Users className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Daily Tiffin */}
      <section className="mb-16">
        <SectionHead title="Daily Tiffin plans" subtitle="Home-style meals without the daily hassle"
          action={<Button data-testid="home-tiffin-explore-button" variant="ghost" className="rounded-full gap-1" onClick={() => nav("/tiffin")}>Explore <ArrowRight className="w-4 h-4" /></Button>} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TIFFIN.slice(0, 3).map((t, i) => <TiffinCard key={t.id} t={t} i={i} testIdScope="home" />)}
        </div>
      </section>

      {/* Eco */}
      <section className="mb-16">
        <SectionHead title="Eco-friendly choices" subtitle="Providers offering reduced-packaging Eco Mode" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {RESTAURANTS.filter((r) => r.eco).slice(0, 4).map((r, i) => <RestaurantCard key={r.id} r={r} i={i} testIdScope="home-eco" />)}
        </div>
      </section>
    </PageWrap>
  );
}
