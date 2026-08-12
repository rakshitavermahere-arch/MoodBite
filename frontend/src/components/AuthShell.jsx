import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { FallbackImage } from "@/components/FallbackImage";
import { IMG } from "@/data/mockData";


export function AuthShell({ eyebrow, title, description, children }) {
  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(460px,.95fr)]">
      <section className="relative hidden lg:block min-h-screen overflow-hidden" aria-label="Students sharing a MoodBite meal">
        <FallbackImage src={IMG.group} alt="Students sharing food together" testId="auth-hero-image" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        <Link to="/" data-testid="auth-hero-brand-link" className="absolute top-8 left-10 font-heading text-2xl font-black text-white">Mood<span className="text-primary">Bite</span></Link>
        <div className="absolute left-10 bottom-12 max-w-lg text-white">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/80 mb-5"><Sparkles className="w-4 h-4 text-primary" /> Food that gets campus life</div>
          <h2 className="font-heading text-5xl font-black leading-[1.02]">One account for cravings, crews, and everyday meals.</h2>
          <p className="mt-5 text-lg text-white/80 max-w-md">Your cart, group orders, Tiffin plans, reviews, and Eco impact stay together.</p>
        </div>
      </section>

      <section className="min-h-screen flex items-center px-5 py-10 sm:px-10 lg:px-16">
        <div className="w-full max-w-md mx-auto">
          <Link to="/" data-testid="auth-back-home-link" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-10">
            <ArrowLeft className="w-4 h-4" /> Back to MoodBite
          </Link>
          <div className="lg:hidden font-heading text-2xl font-black mb-10">Mood<span className="text-primary">Bite</span></div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">{eyebrow}</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-black leading-tight">{title}</h1>
          <p className="text-muted-foreground mt-3 mb-8">{description}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
