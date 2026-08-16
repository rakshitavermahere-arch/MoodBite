import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Leaf, Loader2 } from "lucide-react";
import { PageWrap } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, apiError } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const rupee = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function Checkout() {
  const navigate = useNavigate();
  const { refreshOrders, clearCartLocal } = useApp();
  const [params] = useSearchParams();
  const groupId = params.get("group_id");
  const [quote, setQuote] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [address, setAddress] = useState({ line: "", city: "Bengaluru", pincode: "" });
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const idempotency = useRef(window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [{ data: orderQuote }, { data: providerStatus }] = await Promise.all([
        api.post("/checkout/quote", { group_id: groupId }),
        api.get("/payments/availability"),
      ]);
      setQuote(orderQuote);
      setAvailability(providerStatus);
    } catch (requestError) {
      setError(apiError(requestError, "Could not prepare checkout."));
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  const pay = async () => {
    console.log("PAY BUTTON CLICKED");
    if (address.line.trim().length < 8 || !/^\d{6}$/.test(address.pincode)) {
      setError("Enter a complete delivery address and six-digit pincode.");
      return;
    }

    setPaying(true);
    setError("");

    try {
      const { data } = await api.post("/orders/demo");
      await refreshOrders();
      clearCartLocal();
      navigate(`/processing-payment?orderId=${data.order_id}`);
    } catch (error) {
      setError("Could not create order");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <PageWrap>
        <div data-testid="checkout-loading" className="min-h-[55vh] grid place-items-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      </PageWrap>
    );
  }

  if (!quote) {
    return (
      <PageWrap>
        <div className="max-w-md mx-auto text-center py-20">
          <p role="alert" data-testid="checkout-error-alert" className="text-destructive">
            {error}
          </p>
          <Button data-testid="checkout-retry-button" onClick={load} className="rounded-full mt-5">
            Retry
          </Button>
        </div>
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      <button
        data-testid="checkout-back-button"
        onClick={() => navigate(groupId ? "/group" : "/cart")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-10 items-start">
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Secure checkout</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-black mt-2">Confirm delivery and payment.</h1>
          <p className="text-muted-foreground mt-3">
            Totals come from MoodBite's server catalog, never from browser prices.
          </p>

          {error && (
            <div
              role="alert"
              data-testid="checkout-action-error-alert"
              className="rounded-xl bg-destructive/5 border border-destructive/20 text-destructive text-sm p-4 mt-6"
            >
              {error}
            </div>
          )}

          <div className="mt-8 space-y-5">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-heading font-black text-xl mb-5">Delivery address</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address-line">Hostel, flat, or building</Label>
                  <Input
                    id="address-line"
                    data-testid="checkout-address-input"
                    value={address.line}
                    onChange={(event) => setAddress((value) => ({ ...value, line: event.target.value }))}
                    placeholder="Room 204, Maple Hostel"
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address-city">City</Label>
                    <Input
                      id="address-city"
                      data-testid="checkout-city-input"
                      value={address.city}
                      onChange={(event) => setAddress((value) => ({ ...value, city: event.target.value }))}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address-pincode">Pincode</Label>
                    <Input
                      id="address-pincode"
                      data-testid="checkout-pincode-input"
                      value={address.pincode}
                      onChange={(event) =>
                        setAddress((value) => ({ ...value, pincode: event.target.value.replace(/\D/g, "").slice(0, 6) }))
                      }
                      inputMode="numeric"
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-card p-6">
              <h2 className="font-heading font-black text-xl mb-5">Choose Payment Method</h2>

              <div className="grid sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod("upi")}
                  className={`rounded-xl border p-4 text-left ${
                    paymentMethod === "upi" ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  UPI
                </button>

                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`rounded-xl border p-4 text-left ${
                    paymentMethod === "card" ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  Card
                </button>

                <button
                  onClick={() => setPaymentMethod("cod")}
                  className={`rounded-xl border p-4 text-left ${
                    paymentMethod === "cod" ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  Cash on Delivery
                </button>
              </div>

              {paymentMethod === "upi" && (
                <div className="mt-6 rounded-xl bg-muted p-5">
                  <h3 className="font-bold mb-3">UPI Payment</h3>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MoodBiteDemo"
                    alt="QR"
                    className="w-40 h-40 rounded-xl"
                  />
                  <p className="text-sm text-muted-foreground mt-3">Scan QR and click confirm payment.</p>
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="mt-6 grid gap-4">
                  <Input placeholder="Card Number" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="MM/YY" />
                    <Input placeholder="CVV" />
                  </div>
                  <Input placeholder="Card Holder Name" />
                </div>
              )}

              {paymentMethod === "cod" && (
                <div className="mt-6 rounded-xl bg-muted p-5">
                  <p>Pay in cash when your order arrives.</p>
                </div>
              )}

              <Button onClick={pay} disabled={paying} className="rounded-full h-12 px-7 mt-6">
                {paying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  `Pay ${rupee(quote.total)}`
                )}
              </Button>

              {paymentSuccess && (
                <div className="mt-5 rounded-xl bg-eco/10 border border-eco/30 p-4 text-eco">
                  <Check className="w-5 h-5 inline mr-2" />
                  Payment Successful! Creating your order...
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-28">
          <h2 className="font-heading font-black text-xl">Order summary</h2>
          <div className="space-y-4 mt-5">
            {quote.items.map((item) => (
              <div key={item.product_id} className="flex justify-between gap-4 text-sm">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-muted-foreground">
                    {item.quantity} × {rupee(item.unit_price)}
                  </p>
                </div>
                <span className="font-bold">{rupee(item.line_total)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-5 pt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{rupee(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{rupee(quote.delivery)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated taxes</span>
              <span>{rupee(quote.taxes)}</span>
            </div>
            {quote.eco_discount > 0 && (
              <div data-testid="checkout-eco-discount" className="flex justify-between text-eco">
                <span className="flex gap-1">
                  <Leaf className="w-4 h-4" /> Eco packaging credit
                </span>
                <span>−{rupee(quote.eco_discount)}</span>
              </div>
            )}
            <div data-testid="checkout-total" className="flex justify-between text-lg font-black border-t pt-3 mt-3">
              <span>Total</span>
              <span>{rupee(quote.total)}</span>
            </div>
          </div>
          <div className="rounded-xl bg-muted/50 p-3 mt-5 text-xs text-muted-foreground flex gap-2">
            <Check className="w-4 h-4 text-eco shrink-0" /> Amounts are recalculated on the server from catalog IDs and quantities.
          </div>
        </aside>
      </div>
    </PageWrap>
  );
}