import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { apiError } from "@/lib/api";


export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeGoogle } = useAuth();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(location.hash.replace(/^#/, ""));
    const sessionId = params.get("session_id");
    window.history.replaceState({}, document.title, "/auth/callback");
    if (!sessionId) {
      setError("Google did not return a valid sign-in session.");
      return;
    }
    const requested = sessionStorage.getItem("moodbite:oauth-next") || "/profile";
    const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/profile";
    completeGoogle(sessionId)
      .then(() => { sessionStorage.removeItem("moodbite:oauth-next"); navigate(next, { replace: true }); })
      .catch((requestError) => setError(apiError(requestError, "Google sign-in could not be completed.")));
  }, [location.hash, completeGoogle, navigate]);

  return (
    <main className="min-h-screen bg-background grid place-items-center px-5">
      <div className="max-w-sm text-center">
        <div className="font-heading text-3xl font-black mb-7">Mood<span className="text-primary">Bite</span></div>
        {error ? <><div role="alert" data-testid="google-auth-error-alert" className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5 text-sm text-destructive">{error}</div><Button data-testid="google-auth-return-login-button" onClick={() => navigate("/login", { replace: true })} className="rounded-full mt-5">Return to sign in</Button></> : <div data-testid="google-auth-loading" className="flex items-center justify-center gap-3 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin text-primary" /> Verifying your Google account…</div>}
      </div>
    </main>
  );
}
