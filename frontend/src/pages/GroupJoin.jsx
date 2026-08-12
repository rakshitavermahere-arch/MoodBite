import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link2, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { api, apiError } from "@/lib/api";


export default function GroupJoin() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { setGroup } = useApp();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    api.get(`/groups/invite/${code}`).then(({ data }) => setPreview(data)).catch((requestError) => setError(apiError(requestError, "This group invite is invalid or expired.")));
  }, [code]);

  const join = async () => {
    setJoining(true);
    try {
      const { data } = await api.post(`/groups/join/${code}`);
      setGroup(data);
      navigate("/group", { replace: true });
    } catch (requestError) { setError(apiError(requestError, "Could not join this group.")); }
    finally { setJoining(false); }
  };

  return (
    <main className="min-h-screen bg-background grid place-items-center px-5 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-border bg-card p-7 sm:p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-5"><Link2 className="w-7 h-7" /></div>
        {error ? <><h1 className="font-heading text-3xl font-black">Invite unavailable</h1><p role="alert" data-testid="group-join-error-alert" className="text-muted-foreground mt-3">{error}</p><Button data-testid="group-join-home-button" onClick={() => navigate("/")} className="rounded-full mt-6">Back to MoodBite</Button></> : !preview ? <div data-testid="group-join-loading" className="flex justify-center gap-3 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin text-primary" /> Checking invite…</div> : <><p className="text-xs font-bold uppercase tracking-widest text-primary">{preview.code}</p><h1 className="font-heading text-4xl font-black mt-3">Join {preview.name}</h1><p className="text-muted-foreground mt-3">{preview.host} is hosting · {preview.member_count} participant{preview.member_count === 1 ? "" : "s"}</p><div className="rounded-2xl bg-muted/50 p-4 mt-6 text-sm flex gap-3 text-left"><Users className="w-5 h-5 text-primary shrink-0" /><p>You’ll add and edit only your own items while everyone sees live totals.</p></div><Button data-testid="group-join-confirm-button" onClick={join} disabled={joining} className="rounded-full h-12 px-8 mt-7">{joining ? <><Loader2 className="w-4 h-4 animate-spin" /> Joining…</> : "Join group order"}</Button></>}
      </section>
    </main>
  );
}
