import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { apiError } from "@/lib/api";


export default function Login() {
  const { login, startGoogle, authenticated } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const requested = params.get("next") || "/profile";
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/profile";

  if (authenticated) return <Navigate to={next} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!email.includes("@") || password.length < 1) {
      setError("Enter a valid email and password.");
      return;
    }
    setSubmitting(true);
    try {
      await login({ email, password });
      toast.success("Welcome back to MoodBite");
      navigate(next, { replace: true });
    } catch (requestError) {
      setError(apiError(requestError, "Sign in failed. Please retry."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell eyebrow="Welcome back" title="Your next good meal starts here." description="Sign in to continue your cart, group order, Tiffin plan, and Eco streak.">
      <form onSubmit={submit} className="space-y-5" noValidate>
        {error && <div role="alert" data-testid="login-error-alert" className="rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" data-testid="login-email-input" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" inputMode="email" placeholder="you@college.edu" className="h-12 rounded-xl bg-card" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center"><Label htmlFor="login-password">Password</Label><Link to="/forgot-password" data-testid="login-forgot-password-link" className="text-sm font-semibold text-primary hover:underline">Forgot password?</Link></div>
          <PasswordInput id="login-password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Your password" inputTestId="login-password-input" toggleTestId="login-password-visibility-button" />
        </div>
        <Button type="submit" data-testid="login-submit-button" disabled={submitting} className="w-full h-12 rounded-full font-bold">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : "Sign in"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-7">New to MoodBite? <Link to={`/signup?next=${encodeURIComponent(next)}`} data-testid="login-signup-link" className="font-bold text-foreground hover:text-primary">Create an account</Link></p>
    </AuthShell>
  );
}
