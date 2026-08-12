import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Clock3, Copy, Link2, Loader2, Minus, Plus, QrCode, Radio, Share2, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { SectionHead } from "@/components/Cards";
import { PageWrap } from "@/components/Layout";
import { FallbackImage } from "@/components/FallbackImage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useCatalog } from "@/context/CatalogContext";
import { api, apiError, backendAssetUrl } from "@/lib/api";


const rupee = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function GroupOrders() {
  const { user } = useAuth();
  const { group, setGroup, startGroup } = useApp();
  const { foods } = useCatalog();
  const navigate = useNavigate();
  const [name, setName] = useState("Campus food run");
  const [loading, setLoading] = useState(!group);
  const [creating, setCreating] = useState(false);
  const [connection, setConnection] = useState("connecting");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/groups/current");
      setGroup(data);
      setError("");
    } catch (requestError) {
      setError(apiError(requestError, "Could not load your group order."));
    } finally { setLoading(false); }
  }, [setGroup]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!group?.group_id) return;
    const wsBase = process.env.REACT_APP_BACKEND_URL.replace(/^http/, "ws");
    const socket = new WebSocket(`${wsBase}/api/groups/${group.group_id}/ws`);
    socket.onopen = () => { setConnection("live"); socket.send("ready"); };
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.group) setGroup(message.group);
    };
    socket.onerror = () => setConnection("polling");
    socket.onclose = () => setConnection("polling");
    const poll = window.setInterval(() => {
      if (socket.readyState !== WebSocket.OPEN) api.get(`/groups/${group.group_id}`).then(({ data }) => setGroup(data)).catch(() => {});
    }, 5000);
    return () => { window.clearInterval(poll); socket.close(); };
  }, [group?.group_id, setGroup]);

  const host = group?.host_user_id === user.user_id;
  const myItems = useMemo(() => group?.items?.filter((item) => item.user_id === user.user_id) || [], [group, user.user_id]);

  const create = async () => {
    setCreating(true);
    const created = await startGroup(name);
    if (created) toast.success("Group order is live");
    setCreating(false);
  };

  const mutate = async (method, url, payload) => {
    try {
      const { data } = await api.request({ method, url, data: payload });
      setGroup(data);
    } catch (requestError) { toast.error(apiError(requestError, "Could not update the group.")); }
  };

  const copyInvite = async () => {
    await navigator.clipboard.writeText(group.invite_url);
    toast.success("Invite link copied");
  };

  const shareInvite = async () => {
    if (navigator.share) await navigator.share({ title: group.name, text: `Join my MoodBite group ${group.code}`, url: group.invite_url });
    else await copyInvite();
  };

  if (loading) return <PageWrap><div data-testid="group-loading" className="min-h-[50vh] grid place-items-center"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div></PageWrap>;
  if (error) return <PageWrap><div role="alert" data-testid="group-error-alert" className="max-w-md mx-auto text-center py-20"><p className="text-destructive">{error}</p><Button data-testid="group-retry-button" onClick={load} className="rounded-full mt-5">Retry</Button></div></PageWrap>;

  if (!group) {
    return (
      <PageWrap>
        <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center min-h-[68vh]">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-5"><Users className="w-4 h-4" /> Shared cart, clear ownership</span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black max-w-2xl">Order together without losing track of anyone’s food.</h1>
            <p className="text-muted-foreground text-lg mt-5 max-w-xl">Create one live cart. Friends join through a real link or QR, add only their items, and see their exact contribution.</p>
            <div className="max-w-md mt-8 space-y-3">
              <Input data-testid="group-name-input" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} className="h-12 rounded-xl bg-card" />
              <Button data-testid="start-group-button" onClick={create} disabled={creating || name.trim().length < 2} className="rounded-full h-12 px-7 gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Start group order
              </Button>
            </div>
          </div>
          <FallbackImage src="https://images.pexels.com/photos/6805151/pexels-photo-6805151.jpeg" alt="Friends sharing a meal" testId="group-empty-image" className="w-full aspect-[4/3] object-cover rounded-3xl" />
        </div>
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      <div className="flex flex-wrap justify-between gap-5 items-start mb-8">
        <div><p className="text-xs font-bold uppercase tracking-widest text-primary">Live group order</p><h1 className="font-heading text-4xl sm:text-5xl font-black mt-2">{group.name}</h1><p className="text-muted-foreground mt-2">Host: {group.members.find((item) => item.user_id === group.host_user_id)?.name}</p></div>
        <div data-testid="group-connection-status" className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${connection === "live" ? "bg-eco/10 text-eco" : "bg-amber-100 text-amber-700"}`}><Radio className="w-3.5 h-3.5" />{connection === "live" ? "Live updates" : "Reconnecting with polling"}</div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_390px] gap-8 items-start">
        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
            <div className="flex flex-wrap justify-between gap-4 items-center mb-6">
              <SectionHead title="Shared cart" sub={`${group.items.length} item lines · you can edit only your own`} />
              <Dialog>
                <DialogTrigger asChild><Button data-testid="group-add-items-button" className="rounded-full gap-2"><Plus className="w-4 h-4" /> Add my items</Button></DialogTrigger>
                <DialogContent data-testid="group-add-items-dialog" closeTestId="group-add-items-close-button" className="max-w-2xl rounded-2xl max-h-[82vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Add to your part of the cart</DialogTitle><DialogDescription>Only you can update or remove these selections.</DialogDescription></DialogHeader>
                  <div className="grid sm:grid-cols-2 gap-3 mt-3">
                    {foods.slice(0, 12).map((food) => <div key={food.id} className="flex gap-3 rounded-xl border border-border p-3"><FallbackImage src={food.img} alt={food.name} className="w-16 h-16 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="font-bold text-sm truncate">{food.name}</p><p className="text-xs text-muted-foreground">{rupee(food.price)}</p><Button size="sm" data-testid={`group-add-${food.id}-button`} onClick={() => mutate("post", `/groups/${group.group_id}/items`, { product_id: food.id, quantity: 1 })} className="h-7 rounded-full mt-2">Add</Button></div></div>)}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {group.items.length === 0 ? <div data-testid="group-cart-empty-state" className="py-12 text-center text-muted-foreground">The cart is empty. Invite friends or add your first dish.</div> : (
              <div className="space-y-6">
                {group.members.map((member) => {
                  const items = group.items.filter((item) => item.user_id === member.user_id);
                  if (!items.length) return null;
                  return <div key={member.user_id} data-testid={`group-member-${member.user_id}-section`}><div className="flex justify-between items-center mb-3"><div className="flex items-center gap-2"><Avatar className="w-7 h-7"><AvatarImage src={member.picture} /><AvatarFallback>{member.name[0]}</AvatarFallback></Avatar><p className="font-bold text-sm">{member.name}{member.user_id === user.user_id ? " · You" : ""}</p></div><p data-testid={`group-member-${member.user_id}-contribution`} className="font-bold">{rupee(group.contributions[member.user_id])}</p></div><div className="space-y-2">{items.map((item) => {
                    const mine = item.user_id === user.user_id;
                    return <div key={item.item_id} data-testid={`group-item-${item.item_id}`} className="flex items-center gap-3 rounded-xl bg-muted/40 p-3"><FallbackImage src={item.img} alt={item.name} className="w-14 h-14 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="font-semibold truncate">{item.name}</p><p className="text-xs text-muted-foreground">{rupee(item.price)} each</p></div>{mine ? <div className="flex items-center rounded-full border bg-card"><button aria-label={`Decrease ${item.name}`} data-testid={`group-item-${item.item_id}-decrease-button`} onClick={() => item.quantity === 1 ? mutate("delete", `/groups/${group.group_id}/items/${item.item_id}`) : mutate("patch", `/groups/${group.group_id}/items/${item.item_id}`, { quantity: item.quantity - 1 })} className="w-8 h-8 grid place-items-center"><Minus className="w-3.5 h-3.5" /></button><span data-testid={`group-item-${item.item_id}-quantity`} className="w-6 text-center text-sm font-bold">{item.quantity}</span><button aria-label={`Increase ${item.name}`} data-testid={`group-item-${item.item_id}-increase-button`} onClick={() => mutate("patch", `/groups/${group.group_id}/items/${item.item_id}`, { quantity: item.quantity + 1 })} className="w-8 h-8 grid place-items-center"><Plus className="w-3.5 h-3.5" /></button></div> : <span className="text-sm font-bold">×{item.quantity}</span>}{mine && <button aria-label={`Remove ${item.name}`} data-testid={`group-item-${item.item_id}-remove-button`} onClick={() => mutate("delete", `/groups/${group.group_id}/items/${item.item_id}`)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>}</div>;
                  })}</div></div>;
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
            <SectionHead title="Contribution status" sub="Participants mark sent; only the host can confirm receipt." />
            <div className="space-y-3">
              {group.members.filter((member) => member.user_id !== group.host_user_id).map((member) => {
                const status = group.settlements[member.user_id] || "owed";
                return <div key={member.user_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/40 p-4"><div><p className="font-bold">{member.name}</p><p className="text-sm text-muted-foreground">{rupee(group.contributions[member.user_id])} · {status}</p></div><div className="flex gap-2">{member.user_id === user.user_id && status === "owed" && <Button size="sm" data-testid={`settlement-${member.user_id}-mark-sent-button`} onClick={() => mutate("post", `/groups/${group.group_id}/settlements/${member.user_id}`, { status: "sent" })} className="rounded-full">I’ve sent it</Button>}{host && status === "sent" && <Button size="sm" data-testid={`settlement-${member.user_id}-confirm-button`} onClick={() => mutate("post", `/groups/${group.group_id}/settlements/${member.user_id}`, { status: "received" })} className="rounded-full bg-eco hover:bg-eco/90"><Check className="w-4 h-4" /> Confirm received</Button>}{status === "received" && <span data-testid={`settlement-${member.user_id}-status`} className="inline-flex items-center gap-1 text-sm font-bold text-eco"><Check className="w-4 h-4" /> Settled</span>}</div></div>;
              })}
              {group.members.length === 1 && <p data-testid="group-no-participants-state" className="text-sm text-muted-foreground">Settlement appears after a friend joins.</p>}
            </div>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-28">
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4"><QrCode className="w-5 h-5 text-primary" /><h2 className="font-heading font-black text-xl">Invite friends</h2></div>
            <img data-testid="group-invite-qr-image" src={backendAssetUrl(`/api/groups/invite/${group.code}/qr`)} alt={`Scannable invite QR for ${group.code}`} className="w-48 h-48 mx-auto rounded-xl border bg-white p-2" />
            <div data-testid="group-invite-code" className="font-mono text-center font-black text-lg mt-4 tracking-widest">{group.code}</div>
            <p className="text-xs text-muted-foreground text-center mt-1 flex justify-center items-center gap-1"><Clock3 className="w-3 h-3" /> Expires in 24 hours</p>
            <div className="grid grid-cols-2 gap-2 mt-5"><Button data-testid="group-copy-invite-button" variant="outline" onClick={copyInvite} className="rounded-full gap-2"><Copy className="w-4 h-4" /> Copy</Button><Button data-testid="group-share-invite-button" onClick={shareInvite} className="rounded-full gap-2"><Share2 className="w-4 h-4" /> Share</Button></div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading font-black text-xl mb-4">Order total</h2>
            <div className="space-y-2 text-sm"><div className="flex justify-between"><span>Food subtotal</span><span>{rupee(group.subtotal)}</span></div><div className="flex justify-between"><span>Delivery</span><span>{rupee(group.delivery)}</span></div><div className="flex justify-between"><span>Estimated taxes</span><span>{rupee(group.taxes)}</span></div><div data-testid="group-order-total" className="flex justify-between font-black text-lg border-t pt-3 mt-3"><span>Total</span><span>{rupee(group.total)}</span></div></div>
            {host ? <Button data-testid="group-review-checkout-button" disabled={!group.items.length} onClick={() => navigate(`/checkout?group_id=${group.group_id}`)} className="w-full rounded-full h-11 mt-5">Review checkout</Button> : <p className="text-xs text-muted-foreground mt-5">The host starts checkout. Your items remain live until then.</p>}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <p className="font-bold text-sm flex items-center gap-2"><Users className="w-4 h-4" /> {group.members.length} participant{group.members.length === 1 ? "" : "s"}</p>
            <div className="flex -space-x-2 mt-3">{group.members.map((member) => <Avatar key={member.user_id} className="border-2 border-card"><AvatarImage src={member.picture} /><AvatarFallback>{member.name[0]}</AvatarFallback></Avatar>)}</div>
          </section>
        </aside>
      </div>
    </PageWrap>
  );
}
