import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function PaymentCancel() {
  const navigate = useNavigate();
  return <main className="min-h-screen bg-background grid place-items-center px-5"><section data-testid="payment-cancelled-state" className="max-w-lg text-center"><XCircle className="w-16 h-16 text-primary mx-auto" /><h1 className="font-heading text-4xl font-black mt-5">Payment wasn’t completed</h1><p className="text-muted-foreground mt-3">No success was recorded and your cart remains available.</p><div className="flex justify-center gap-3 mt-7"><Button data-testid="payment-cancel-return-cart-button" variant="outline" onClick={() => navigate("/cart")} className="rounded-full">Return to cart</Button><Button data-testid="payment-cancel-retry-button" onClick={() => navigate("/checkout")} className="rounded-full">Retry checkout</Button></div></section></main>;
}
