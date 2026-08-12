import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, apiError } from "@/lib/api";


export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState("verifying");
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) { setError("Payment session is missing."); setStatus("error"); return; }
    let attempts = 0;
    let timer;
    const verify = async () => {
      try {
        const { data } = await api.get(`/payments/status/${sessionId}`);
        setOrderId(data.order_id);
        if (data.payment_status === "paid") setStatus("paid");
        else if (["failed", "expired"].includes(data.payment_status)) setStatus(data.payment_status);
        else if (++attempts < 8) timer = window.setTimeout(verify, 2000);
        else { setStatus("pending"); }
      } catch (requestError) { setError(apiError(requestError, "Could not verify payment.")); setStatus("error"); }
    };
    verify();
    return () => window.clearTimeout(timer);
  }, [sessionId]);

  return <main className="min-h-screen bg-background grid place-items-center px-5"><section className="max-w-lg text-center">{status === "paid" ? <div data-testid="payment-verified-success"><CheckCircle2 className="w-16 h-16 text-eco mx-auto" /><h1 className="font-heading text-4xl font-black mt-5">Payment verified</h1><p className="text-muted-foreground mt-3">Order {orderId} is confirmed by the payment provider.</p><Button data-testid="payment-track-order-button" onClick={() => navigate(`/track/${orderId}`)} className="rounded-full mt-7">Track order</Button></div> : <div data-testid="payment-verification-status"><Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" /><h1 className="font-heading text-3xl font-black mt-5">Verifying payment</h1><p role={error ? "alert" : undefined} className="text-muted-foreground mt-3">{error || (status === "pending" ? "The provider has not confirmed payment yet. Check Orders before trying again." : "MoodBite is waiting for server confirmation. This page never marks payment successful on redirect alone.")}</p>{status !== "verifying" && <Button data-testid="payment-view-orders-button" onClick={() => navigate("/orders")} className="rounded-full mt-7">View orders</Button>}</div>}</section></main>;
}
