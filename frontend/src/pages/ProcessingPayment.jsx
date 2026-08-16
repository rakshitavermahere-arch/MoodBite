import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProcessingPayment() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/payment-success?demo=true");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md">
        <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary mb-6" />

        <h1 className="text-4xl font-black mb-4">Processing Payment</h1>

        <p className="text-muted-foreground text-lg">
          Securing your order, confirming payment and notifying the restaurant...
        </p>
      </div>
    </div>
  );
}