import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { apiError } from "@/lib/api";


export default function Signup() {
  const { register, startGoogle, authenticated } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm_password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const requested = params.get("next") || "/profile";
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/profile";
  const rules = useMemo(() => [
    [form.password.length >= 10, "10+ characters"],
    [/[a-z]/.test(form.password) && /[A-Z]/.test(form.password), "Upper and lowercase"],
    [/\d/.test(form.password), "At least one number"],
  ], [form.password]);

  if (authenticated) return <Navigate to={next} replace />;
  const update = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.name.trim().length < 2 || !form.email.includes("@")) return setError("Enter your name and a valid email.");
    if (!rules.every(([valid]) => valid)) return setError("Choose a stronger password using the rules below.");
    if (form.password !== form.confirm_password) return setError("Passwords do not match.");
    setSubmitting(true);
    try {
      await register({ ...form, name: form.name.trim() });
      toast.success("Your MoodBite account is ready");
      navigate(next, { replace: true });
    } catch (requestError) {
      setError(apiError(requestError, "Could not create your account."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell eyebrow="Join MoodBite" title="Bring every food plan into one place." description="Save favourites, order with friends, and build a better everyday-food routine.">
      <Button type="button" variant="outline" data-testid="signup-google-button" onClick={() => startGoogle(next)} className="w-full h-12 rounded-full bg-card border-border gap-3">
        <span className="w-6 h-6 rounded-full bg-white border grid place-items-center font-bold text-sm text-[#4285F4]">G</span> Continue with Google
      </Button>
      <div className="flex items-center gap-4 my-6"><span className="h-px bg-border flex-1" /><span className="text-xs uppercase font-bold text-muted-foreground">or email</span><span className="h-px bg-border flex-1" /></div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <div role="alert" data-testid="signup-error-alert" className="rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
        <div className="space-y-2"><Label htmlFor="signup-name">Name</Label><Input id="signup-name" data-testid="signup-name-input" value={form.name} onChange={update("name")} autoComplete="name" placeholder="Your full name" className="h-12 rounded-xl bg-card" /></div>
        <div className="space-y-2"><Label htmlFor="signup-email">Email</Label><Input id="signup-email" data-testid="signup-email-input" value={form.email} onChange={update("email")} autoComplete="email" inputMode="email" placeholder="you@college.edu" className="h-12 rounded-xl bg-card" /></div>
        <div className="space-y-2"><Label htmlFor="signup-password">Password</Label><PasswordInput id="signup-password" value={form.password} onChange={update("password")} autoComplete="new-password" placeholder="Create a secure password" inputTestId="signup-password-input" toggleTestId="signup-password-visibility-button" /></div>
        <div className="grid grid-cols-3 gap-2" data-testid="signup-password-rules">
          {rules.map(([valid, label]) => <div key={label} className={`text-[11px] flex items-center gap-1 ${valid ? "text-eco" : "text-muted-foreground"}`}><Check className="w-3 h-3" />{label}</div>)}
        </div>
        <div className="space-y-2"><Label htmlFor="signup-confirm-password">Confirm password</Label><PasswordInput id="signup-confirm-password" value={form.confirm_password} onChange={update("confirm_password")} autoComplete="new-password" placeholder="Repeat your password" inputTestId="signup-confirm-password-input" toggleTestId="signup-confirm-password-visibility-button" /></div>
        <Button type="submit" data-testid="signup-submit-button" disabled={submitting} className="w-full h-12 rounded-full font-bold">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : "Create account"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-7">Already have an account? <Link to={`/login?next=${encodeURIComponent(next)}`} data-testid="signup-login-link" className="font-bold text-foreground hover:text-primary">Sign in</Link></p>
    </AuthShell>
  );
}
