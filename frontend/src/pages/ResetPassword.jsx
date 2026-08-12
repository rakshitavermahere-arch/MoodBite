import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api, apiError } from "@/lib/api";


export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!token) return setError("This reset link is missing its security token.");
    if (password.length < 10) return setError("Password must be at least 10 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password, confirm_password: confirm });
      setDone(true);
    } catch (requestError) { setError(apiError(requestError, "Could not reset your password.")); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell eyebrow="Choose a new password" title="Secure your MoodBite account." description="A successful reset signs out every existing session on your account.">
      {done ? (
        <div data-testid="reset-password-success" className="rounded-2xl border border-eco/25 bg-eco/5 p-6"><p className="font-heading font-bold text-lg">Password updated</p><p className="text-sm text-muted-foreground mt-2">Sign in again with your new password.</p><Button asChild className="rounded-full mt-5"><Link to="/login" data-testid="reset-password-login-link">Sign in</Link></Button></div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          {error && <div role="alert" data-testid="reset-password-error-alert" className="rounded-xl bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
          <div className="space-y-2"><Label htmlFor="reset-password">New password</Label><PasswordInput id="reset-password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" inputTestId="reset-password-input" toggleTestId="reset-password-visibility-button" /></div>
          <div className="space-y-2"><Label htmlFor="reset-confirm">Confirm password</Label><PasswordInput id="reset-confirm" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" inputTestId="reset-confirm-password-input" toggleTestId="reset-confirm-password-visibility-button" /></div>
          <Button data-testid="reset-password-submit-button" disabled={loading} className="w-full h-12 rounded-full">{loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : "Update password"}</Button>
        </form>
      )}
    </AuthShell>
  );
}
