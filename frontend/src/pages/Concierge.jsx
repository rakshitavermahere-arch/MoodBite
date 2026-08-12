import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Send, Star, Clock, Plus, ArrowRight, Utensils, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageWrap } from "@/components/Layout";
import { VegDot } from "@/components/Cards";
import { useApp } from "@/context/AppContext";
import { rupee } from "@/data/mockData";
import { api, apiError } from "@/lib/api";

const SUGGESTIONS = [
  "I'm feeling sad and want comfort food under ₹250",
  "I'm studying and need something filling but not too heavy",
  "I want something spicy for three people",
  "I have ₹150 and I'm really hungry",
  "I need affordable home-style food for the next month",
  "Find me a vegetarian dinner under ₹200",
];

function TypingDots() {
  return (
    <div className="flex gap-1.5 py-2 px-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce-dot" style={{ animationDelay: `${i * 0.16}s` }} />
      ))}
    </div>
  );
}

function RecCard({ rec, i, messageIndex }) {
  const { addToCart } = useApp();
  const nav = useNavigate();
  const isTiffin = rec.type === "tiffin";
  return (
    <motion.div initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.12 }}
      data-testid={`concierge-message-${messageIndex}-recommendation-${rec.id}`} className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isTiffin && <VegDot veg={rec.veg} />}
            <div>
              <h4 className="font-heading font-bold leading-tight">{rec.name}</h4>
              <p className="text-xs text-muted-foreground">{isTiffin ? `${rec.meals} · ${rec.area}` : rec.restaurant}</p>
            </div>
          </div>
          <span className={`shrink-0 px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 ${isTiffin ? "bg-eco/15 text-eco" : "bg-primary/10 text-primary"}`}>
            {isTiffin ? <CalendarCheck className="w-3 h-3" /> : <Utensils className="w-3 h-3" />}{isTiffin ? "Tiffin" : "Dish"}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-eco text-eco" />{rec.rating}</span>
          {!isTiffin && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{rec.timing}</span>}
          {isTiffin && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{rec.flexibility} flexibility</span>}
        </div>
        <div className="mt-3 rounded-xl bg-accent/60 border border-border p-3">
          <p className="text-xs text-foreground/80"><span className="font-bold text-primary">Why: </span>{rec.reason}</p>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-heading font-black text-lg">{rupee(isTiffin ? rec.monthly : rec.price)}<span className="text-xs font-normal text-muted-foreground">{isTiffin ? "/mo" : ""}</span></span>
          {isTiffin ? (
            <Button size="sm" data-testid={`concierge-message-${messageIndex}-recommendation-${rec.id}-view-button`} onClick={() => nav(`/tiffin/${rec.id}`)} className="rounded-full h-8 gap-1 bg-eco hover:bg-eco/90">
              View Plans <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" data-testid={`concierge-message-${messageIndex}-recommendation-${rec.id}-details-button`} onClick={() => nav(`/restaurant/${rec.restaurantId}`)} className="rounded-full h-8">Details</Button>
              <Button size="sm" data-testid={`concierge-message-${messageIndex}-recommendation-${rec.id}-add-button`} onClick={() => addToCart(rec)} className="rounded-full h-8 gap-1"><Plus className="w-3.5 h-3.5" />Add</Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Concierge() {
  const [params] = useSearchParams();
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hey! I'm your MoodBite concierge. Tell me your mood, budget, cravings or situation and I'll find your perfect meal." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const scrollRef = useRef(null);
  const startedRef = useRef(false);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post("/concierge", { message: msg, session_id: sessionId });
      setSessionId(data.session_id);
      setMessages((m) => [...m, { role: "ai", text: data.reply, recs: data.recommendations }]);
    } catch (error) {
      setMessages((m) => [...m, { role: "ai", error: true, retry: msg, text: apiError(error, "The concierge is temporarily unavailable. Please retry.") }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = params.get("q");
    if (q && !startedRef.current) { startedRef.current = true; send(q); }
    // eslint-disable-next-line
  }, []);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, loading]);

  return (
    <PageWrap>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-11 h-11 rounded-2xl bg-primary grid place-items-center text-primary-foreground"><Sparkles className="w-5 h-5" /></span>
          <div>
            <h1 className="text-2xl font-heading font-black tracking-tight">AI Food Concierge</h1>
            <p className="text-sm text-muted-foreground">Mood + budget + craving → your perfect meal</p>
          </div>
        </div>

        <div ref={scrollRef} className="rounded-3xl border border-border bg-card p-4 sm:p-6 h-[52vh] overflow-y-auto no-scrollbar space-y-4">
          {messages.map((m, idx) => (
            <div key={idx}>
              {m.role === "user" ? (
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="flex justify-end">
                  <div data-testid={`concierge-user-message-${idx}`} className="max-w-[80%] rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5 text-sm">{m.text}</div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
                  <div className="flex gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0"><Sparkles className="w-4 h-4" /></span>
                    <div data-testid={m.error ? "concierge-error-alert" : `concierge-ai-message-${idx}`} className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm">{m.text}</div>
                  </div>
                  {m.error && <Button size="sm" variant="outline" data-testid={`concierge-retry-${idx}-button`} onClick={() => send(m.retry)} className="rounded-full ml-10">Retry</Button>}
                  {m.recs?.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-3 pl-10">
                      {m.recs.map((r, i) => <RecCard key={r.id + i} rec={r} i={i} messageIndex={idx} />)}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          ))}
          {loading && (
            <div data-testid="concierge-loading-status" className="flex gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0"><Sparkles className="w-4 h-4" /></span>
              <div className="rounded-2xl rounded-bl-md bg-muted px-3"><TypingDots /></div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {SUGGESTIONS.map((s, i) => (
              <button key={s} data-testid={`concierge-suggestion-${i}`} onClick={() => send(s)}
                className="px-3 py-2 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">{s}</button>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1 focus-within:ring-2 ring-primary/40">
          <input value={input} maxLength={1000} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            data-testid="concierge-input" placeholder="Tell me how you feel or what you crave…"
            className="flex-1 bg-transparent outline-none py-3 text-sm" />
          <Button size="icon" data-testid="concierge-send" onClick={() => send()} disabled={loading} className="rounded-full w-10 h-10 shrink-0"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </PageWrap>
  );
}
