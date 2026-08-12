import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Leaf, Loader2, MapPin, Minus, Plus, Quote, Star, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageWrap } from "@/components/Layout";
import { EcoBadge, VegDot } from "@/components/Cards";
import { FallbackImage } from "@/components/FallbackImage";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useCatalog } from "@/context/CatalogContext";
import { api, apiError } from "@/lib/api";
import { rupee } from "@/data/mockData";


function QtyRow({ food }) {
  const { cart, addToCart, updateQty } = useApp();
  const inCart = cart.find((item) => item.id === food.id);
  return (
    <div className="flex items-start gap-4 py-4 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2"><VegDot veg={food.veg} /><h4 className="font-heading font-bold">{food.name}</h4></div>
        <p className="font-semibold text-sm mt-1">{rupee(food.price)}</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">{food.desc}</p>
        <div className="flex gap-1.5 mt-2 flex-wrap">{food.tags.map((tag) => <span key={tag} className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">{tag}</span>)}</div>
      </div>
      <div className="relative w-28 h-24 rounded-xl overflow-hidden shrink-0">
        <FallbackImage src={food.img} alt={food.name} testId={`menu-${food.id}-image`} className="w-full h-full object-cover" />
        {inCart ? <div className="absolute bottom-1 inset-x-2 flex items-center justify-between bg-primary text-primary-foreground rounded-full px-1 h-8"><button aria-label={`Decrease ${food.name}`} data-testid={`menu-${food.id}-decrease-button`} onClick={() => updateQty(food.id, null, -1)} className="w-6 h-6 grid place-items-center"><Minus className="w-3.5 h-3.5" /></button><span data-testid={`menu-${food.id}-quantity`} className="text-sm font-bold">{inCart.qty}</span><button aria-label={`Increase ${food.name}`} data-testid={`menu-${food.id}-increase-button`} onClick={() => updateQty(food.id, null, 1)} className="w-6 h-6 grid place-items-center"><Plus className="w-3.5 h-3.5" /></button></div> : <button data-testid={`menu-add-${food.id}`} onClick={() => addToCart(food)} className="absolute bottom-1 inset-x-2 h-8 rounded-full bg-background border border-border text-primary text-sm font-bold flex items-center justify-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"><Plus className="w-3.5 h-3.5" /> Add</button>}
      </div>
    </div>
  );
}


function Reviews({ restaurant }) {
  const { authenticated } = useAuth();
  const [data, setData] = useState({ average: null, count: 0, reviews: [] });
  const [eligibility, setEligibility] = useState({ eligible: false, order_id: null });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const requests = [api.get(`/reviews/restaurant/${restaurant.id}`)];
      if (authenticated) requests.push(api.get(`/reviews/eligibility/${restaurant.id}`));
      const responses = await Promise.all(requests);
      setData(responses[0].data);
      if (responses[1]) setEligibility(responses[1].data);
      setError("");
    } catch (requestError) { setError(apiError(requestError, "Reviews could not be loaded.")); }
    finally { setLoading(false); }
  }, [restaurant.id, authenticated]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!rating || comment.trim().length < 10) { setError("Choose a star rating and write at least 10 characters."); return; }
    setSubmitting(true);
    try {
      await api.post("/reviews", { order_id: eligibility.order_id, restaurant_id: restaurant.id, rating, comment });
      toast.success("Your verified-order review is live");
      setRating(0); setComment("");
      await load();
    } catch (requestError) { setError(apiError(requestError, "Could not publish your review.")); }
    finally { setSubmitting(false); }
  };

  return (
    <aside>
      <div className="flex items-end justify-between gap-3 mb-4"><div><h2 className="text-xl font-heading font-extrabold">Verified reviews</h2><p data-testid="restaurant-review-summary" className="text-sm text-muted-foreground mt-1">{data.count ? `${data.average} from ${data.count} review${data.count === 1 ? "" : "s"}` : "No reviews yet"}</p></div>{data.average && <span className="inline-flex items-center gap-1 font-black text-eco"><Star className="w-4 h-4 fill-current" />{data.average}</span>}</div>
      {error && <div role="alert" data-testid="review-error-alert" className="rounded-xl bg-destructive/5 p-3 text-sm text-destructive mb-3">{error}</div>}
      {eligibility.eligible && <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4 mb-4"><p className="font-heading font-bold">Review your delivered order</p><div className="flex gap-1 mt-3" role="radiogroup" aria-label="Star rating">{[1, 2, 3, 4, 5].map((value) => <button key={value} role="radio" aria-checked={rating === value} aria-label={`${value} stars`} data-testid={`review-rating-${value}-button`} onClick={() => setRating(value)} className="p-1"><Star className={`w-6 h-6 ${value <= rating ? "fill-primary text-primary" : "text-muted-foreground"}`} /></button>)}</div><Textarea data-testid="review-comment-input" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={800} placeholder="What should another student know?" className="mt-3 min-h-24 rounded-xl bg-card" /><div className="flex items-center justify-between mt-3"><span className="text-xs text-muted-foreground">{comment.length}/800</span><Button size="sm" data-testid="review-submit-button" onClick={submit} disabled={submitting} className="rounded-full">{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish review"}</Button></div></div>}
      {!eligibility.eligible && authenticated && <p data-testid="review-ineligible-message" className="text-xs text-muted-foreground mb-4">Reviews unlock after a delivered order from this restaurant. Each order can be reviewed once.</p>}
      {loading ? <div data-testid="reviews-loading" className="py-8 grid place-items-center"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div> : data.reviews.length ? <div className="space-y-3">{data.reviews.map((review) => <motion.div key={review.review_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} data-testid={`review-${review.review_id}`} className="rounded-2xl border border-border bg-card p-4"><div className="flex items-center justify-between"><span className="font-semibold text-sm">{review.user.name}</span><span className="flex items-center gap-1 text-eco text-sm font-bold"><Star className="w-3.5 h-3.5 fill-current" />{review.rating}</span></div><p className="text-xs text-muted-foreground mt-1">{new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p><p className="text-sm text-muted-foreground mt-2 flex gap-1"><Quote className="w-3.5 h-3.5 shrink-0 mt-0.5" />{review.comment}</p></motion.div>)}</div> : <div data-testid="reviews-empty-state" className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Be the first verified customer to review this restaurant.</div>}
    </aside>
  );
}


export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startGroup } = useApp();
  const { restaurants, foods } = useCatalog();
  const restaurant = restaurants.find((item) => item.id === id);
  const menu = foods.filter((food) => food.restaurantId === id);
  if (!restaurant) return <PageWrap><p data-testid="restaurant-not-found-alert">Restaurant not found.</p></PageWrap>;
  const categories = [...new Set(menu.map((item) => item.cat))];

  const beginGroup = async () => {
    const created = await startGroup(`${restaurant.name} group order`);
    if (created) navigate("/group");
  };

  return (
    <PageWrap>
      <button data-testid="restaurant-detail-back-button" onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground"><ArrowLeft className="w-4 h-4" /> Back</button>
      <div className="relative aspect-[16/6] min-h-56 rounded-3xl overflow-hidden mb-6"><FallbackImage src={restaurant.img} alt={restaurant.name} testId="restaurant-hero-image" className="absolute inset-0 w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" /><div className="absolute bottom-5 left-5 right-5 text-white flex items-end justify-between gap-4"><div><div className="flex gap-2 mb-2">{restaurant.eco && <EcoBadge />}</div><h1 className="text-3xl sm:text-4xl font-heading font-black">{restaurant.name}</h1><p className="text-white/85 mt-1">{restaurant.cuisine}</p></div><span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-eco text-eco-foreground font-bold shrink-0"><Star className="w-4 h-4 fill-current" />{restaurant.rating}</span></div></div>
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4"><span className="flex items-center gap-1"><Clock className="w-4 h-4" />{restaurant.deliveryTime}</span><span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{restaurant.distance}</span><span className="font-semibold text-foreground">{restaurant.priceRange}</span>{restaurant.eco && <span className="flex items-center gap-1 text-eco font-semibold"><Leaf className="w-4 h-4" /> Eco packaging available</span>}</div>
      <p className="text-muted-foreground max-w-2xl mb-6">{restaurant.desc}</p>
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row items-center gap-4 mb-8"><span className="w-12 h-12 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0"><Users className="w-6 h-6" /></span><div className="flex-1 text-center sm:text-left"><h3 className="font-heading font-bold text-lg">Ordering with friends?</h3><p className="text-sm text-muted-foreground">Create a live backend-backed cart where every person owns their selections.</p></div><Button data-testid="start-group-order" onClick={beginGroup} className="rounded-full h-11 px-6 gap-2">Start group <Users className="w-4 h-4" /></Button></div>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8"><div>{categories.map((category) => <section key={category} className="mb-8"><h2 className="text-xl font-heading font-extrabold mb-2">{category}</h2><div className="rounded-2xl border border-border bg-card px-5">{menu.filter((item) => item.cat === category).map((food) => <QtyRow key={food.id} food={food} />)}</div></section>)}</div><Reviews restaurant={restaurant} /></div>
    </PageWrap>
  );
}
