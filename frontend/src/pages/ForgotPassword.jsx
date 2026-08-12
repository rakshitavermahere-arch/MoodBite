import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, apiError } from "@/lib/api";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!email.includes("@")) return setError("Enter a valid email address.");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message);
    } catch (requestError) {
      setError(apiError(requestError, "Could not process this request."));
    } finally { setLoading(false); }
  };

  return (
    <AuthShell eyebrow="Account recovery" title="Reset access, securely." description="For privacy, MoodBite gives the same response whether or not an account exists.">
      {message ? (
        <div data-testid="forgot-password-success" className="rounded-2xl border border-eco/25 bg-eco/5 p-6">
          <CheckCircle2 className="w-8 h-8 text-eco mb-4" />
          <p className="font-heading font-bold text-lg">Request recorded</p>
          <p className="text-sm text-muted-foreground mt-2">{message}</p>
          <p className="text-xs text-muted-foreground mt-4">Email delivery is not configured yet; no reset email has been sent.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          {error && <div role="alert" data-testid="forgot-password-error-alert" className="rounded-xl bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
          <div className="space-y-2"><Label htmlFor="forgot-email">Email</Label><Input id="forgot-email" data-testid="forgot-password-email-input" value={email} onChange={(event) => setEmail(event.target.value)} inputMode="email" autoComplete="email" placeholder="you@college.edu" className="h-12 rounded-xl bg-card" /></div>
          <Button data-testid="forgot-password-submit-button" disabled={loading} className="w-full h-12 rounded-full">{loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Request reset"}</Button>
        </form>
      )}
      <Link to="/login" data-testid="forgot-password-back-login-link" className="block text-center text-sm font-bold mt-7 hover:text-primary">Back to sign in</Link>
    </AuthShell>
  );
}
